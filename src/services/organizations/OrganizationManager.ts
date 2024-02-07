import { inject, injectable } from "inversify";
import IOrganizationService from "./IOrganizationService";
import { Request, Response } from "express";
import { parseFormData, rootParser } from "../../utils";
import { Collection, Db, Document, ObjectId } from "mongodb";
import { ResponseMessage, TYPES } from "../../utils/types";
import IStorageService from "../storage/IStorageService";
import { Organization, Pagination, TreasuryIndexer } from "../../models";
import IAuthService from "../auth/IAuthService";
import { usersCollection } from "../auth/AuthManager";
import { OrganizationFilterRequest } from "../../middlewares";
import { Organization as OrgObj } from "../../libs/firebase-db"
import date from 'date-and-time';

export const organizationCollection = "Organizations"
export const organizationHistoricalBalanceCollection = "OrganizationsHistoricalBalances"

@injectable()
class OrganizationManager implements IOrganizationService {
    constructor(@inject(TYPES.IStorageService) private storageService: IStorageService,
        @inject(TYPES.IAuthService) private authService: IAuthService
    ) { }

    async createOrganization(req: Request, res: Response): Promise<Response> {
        let parsedBody = parseFormData("accounts", req);
        parsedBody.createdDate = new Date().toDateString();
        await this.attachCommonFields(parsedBody);

        const db = req.app.locals.db as Db;
        const io = req.app.locals.io as any; //socket connection

        const collection = db.collection(organizationCollection);
        // await collection.insertOne(parsedBody)

        this.fetchOrganizationAnnualBalance(collection, parsedBody, db.collection(organizationHistoricalBalanceCollection), io)

        return res.status(200).send(ResponseMessage.OrganizationCreated);
    }

    async getOrganizationByName(req: Request, res: Response): Promise<Response> {
        const orgName = req.params.name;
        if (!orgName) return res.status(404).send(ResponseMessage.OrganizationNotFound);

        const db = req.app.locals.db as Db;
        const collection = db.collection(organizationCollection);
        const response = await collection.findOne({ name: orgName });
        if (!response) return res.status(404).send(ResponseMessage.OrganizationNotFound);

        return res.status(200).send(response);
    }

    async getAllOrganizations(req: OrganizationFilterRequest, res: Response): Promise<Response> {
        const pageIndex = parseInt(req.query.pageIndex as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
        const aggregationPipeline = req.aggregationPipeline;

        const db = req.app.locals.db as Db;

        const collection = db.collection<Organization>(organizationCollection);
        let response = await collection.aggregate<Organization>(aggregationPipeline).skip((pageIndex - 1) * pageSize).limit(pageSize).toArray();
        // const user = await this.authService.getUserByPublicKey(req, res)
        // const favoriteOrganizationsMap = new Map(Object.entries(user.favoriteOrganizations));

        // response = response.map((org) => ({
        //     ...org,
        //     isFavorited: favoriteOrganizationsMap.has(org._id.toString()),
        // }));

        if (!response) return res.status(404).send(ResponseMessage.OrganizationNotFound);

        return res.status(200).send(new Pagination(response, await collection.countDocuments(), pageIndex, pageSize,));
    }

    async updateOrganization(req: Request, res: Response): Promise<Response> {
        const parsedBody = parseFormData("accounts", req);
        const orgName = req.params.name;
        parsedBody.updatedDate = new Date().toDateString();
        await this.attachCommonFields(parsedBody)

        const db = req.app.locals.db as Db;
        const collection = db.collection(organizationCollection);

        const result = await collection.updateOne(
            { name: orgName },
            { $set: parsedBody }
        );

        if (result.modifiedCount > 0)
            return res.json({ message: ResponseMessage.OrganizationUpdated });

        return res.status(404).json(ResponseMessage.OrganizationNotFound);
    }

    async addFavorites(req: Request, res: Response): Promise<Response> {
        const orgId = req.params.organizationId;
        const publicKey = req.headers.address;
        if (!orgId || orgId.length > 24) return res.status(422).json({ message: ResponseMessage.OrganizationIdRequired });

        const db = req.app.locals.db as Db;
        const orgs = db.collection(organizationCollection);
        const users = db.collection(usersCollection);

        let organization = await orgs.findOne({ _id: new ObjectId(orgId) });
        if (!organization) return res.json({ message: ResponseMessage.OrganizationNotFound });

        users.createIndex({ publicKey: 1 }, { unique: true });
        const result = await users.updateOne(
            { publicKey: publicKey },
            {
                $set: {
                    [`favoriteOrganizations.${organization._id.toString()}`]: true
                }
            }
        );

        if (result.acknowledged)
            return res.json({ message: ResponseMessage.UserUpdated });

        return res.status(500).json(ResponseMessage.UnknownServerError);
    }

    private async attachCommonFields(parsedBody: any) {
        parsedBody.image = await this.storageService.uploadByteArray(parsedBody.image);
        parsedBody.networks = {};
        parsedBody.isDeleted = false;
        parsedBody.isVerified = false;

        Array.from(parsedBody.accounts).forEach((account: any) => {
            if (!parsedBody.networks[account.chain]) {
                parsedBody.networks[account.chain] = account.chain
            }
        })
    }

    private async fetchOrganizationAnnualBalance(
        collection: Collection<Document>,
        newOrganization: Organization,
        balanceCollection: Collection<Document>,
        io: any) {
        try {
            let historicalTreasury: TreasuryIndexer = {}
            let walletAddresses: string[] = []
            const { accounts, name } = newOrganization;
            const orgObj: OrgObj = { wallets: [] }

            accounts.forEach(account => {
                orgObj.wallets.push({
                    address: account.address,
                    network: account.chain
                })
            })

            await rootParser(orgObj, historicalTreasury, walletAddresses, name);

            historicalTreasury = Object.entries(historicalTreasury)
                .sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1)
                .reduce<typeof historicalTreasury>((a, c) => { a[c[0]] = c[1]; return a }, {})

            let responseObj = {
                name: name,
                addresses: walletAddresses,
                annual: Object.entries(historicalTreasury).length ? Object.entries(historicalTreasury).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce<typeof historicalTreasury>((a, c) => { a[c[0]] = c[1]; return a; }, {}) : {},
            };

            await balanceCollection.insertOne(responseObj)
            console.log("aue");

            // io.emit('annualBalanceFetched', { message: 'Balance fething task completed successfully' });

            return {};
        } catch (error: any) {
            throw new Error(error);
        }
    }
}

export default OrganizationManager;