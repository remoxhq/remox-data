import { inject, injectable } from "inversify";
import IOrganizationService from "./IOrganizationService";
import { NextFunction, Request, Response } from "express";
import { parseFormData, rootParser } from "../../utils";
import { Collection, Db, Document, ObjectId } from "mongodb";
import { ResponseMessage, Roles, TYPES } from "../../utils/types";
import IStorageService from "../storage/IStorageService";
import { Account, AppRequest, AppResponse, CustomError, ExceptionType, Organization, Pagination, Portfolio, TreasuryIndexer } from "../../models";
import { usersCollection } from "../auth/AuthManager";
import { OrganizationFilterRequest } from "../../middlewares";
import { Organization as OrgObj } from "../../libs/firebase-db"
import date from 'date-and-time';
import { handleError } from "../../utils/helpers/responseHandler";
import { compareEnumerable } from "../../utils/helpers/compareEnumerable";

export const organizationCollection = "Organizations"
export const organizationHistoricalBalanceCollection = "OrganizationsHistoricalBalances"

@injectable()
class OrganizationManager implements IOrganizationService {
    constructor(@inject(TYPES.IStorageService) private storageService: IStorageService) { }

    async createOrganization(req: AppRequest, res: Response): Promise<Response> {
        try {
            const db = req.app.locals.db as Db;
            const io = req.app.locals.io as any; //socket connection
            const collection = db.collection(organizationCollection);

            const isExist = await collection.findOne<Organization>({ dashboardLink: req.body.dashboardLink, isDeleted: false })
            if (isExist) throw new CustomError(ResponseMessage.OrganizationAlreadyExist, ExceptionType.BadRequest);

            let parsedBody = parseFormData("accounts", req);
            parsedBody.createdDate = new Date().toDateString();
            parsedBody.createdBy = req.headers.address;
            await this.attachCommonFields(parsedBody, req);

            if (parsedBody.isVerified && req.user?.role !== Roles.SuperAdmin)
                throw new CustomError(ResponseMessage.OrganizationNotFound, ExceptionType.UnAuthorized);

            const createdOrg = await collection.insertOne(parsedBody)

            if (!req.query.removeAnnual) {
                this.fetchOrganizationAnnualBalance(
                    collection,
                    parsedBody,
                    db.collection(organizationHistoricalBalanceCollection),
                    io,
                    createdOrg.insertedId,
                    req.user.publicKey)
            }

            return res.status(200).send(new AppResponse(200, true, undefined, ResponseMessage.OrganizationCreated));
        } catch (error: any) {
            return handleError(res, error)
        }
    }

    async getOrganizationByName(req: AppRequest, res: Response, next: NextFunction): Promise<Response> {
        try {
            const orgSlug = req.params.slug;
            const db = req.app.locals.db as Db;

            const collection = db.collection(organizationCollection);
            const response = await collection.findOne<Organization>({ dashboardLink: orgSlug, isDeleted: false });
            if (!response) throw new CustomError(ResponseMessage.OrganizationNotFound, ExceptionType.NotFound);

            if ((response.isPrivate && response.createdBy !== req.user?.publicKey) && req.user?.role !== Roles.SuperAdmin)
                throw new CustomError(ResponseMessage.ForbiddenRequest, ExceptionType.UnAuthorized);

            return res.status(200).send(new AppResponse(200, true, undefined, response));
        } catch (error: any) {
            return handleError(res, error)
        }
    }

    async getAllOrganizations(req: OrganizationFilterRequest, res: Response): Promise<Response> {
        try {
            const pageIndex = parseInt(req.query.pageIndex as string, 10) || 0;
            const pageSize = parseInt(req.query.pageSize as string, 10);
            const aggregationPipeline = req.aggregationPipeline;

            const db = req.app.locals.db as Db;
            const collection = db.collection<Organization>(organizationCollection);

            let response = await collection.aggregate(aggregationPipeline).toArray();
            const total = response[0].totalRecords[0] ? response[0].totalRecords[0].total : 0

            return res.status(200).send(new AppResponse(200,
                true,
                undefined,
                new Pagination(response[0].data, total, pageIndex, pageSize)));

        } catch (error) {
            return handleError(res, error)
        }
    }

    async getAllOrgsForDailyUpdate(req: OrganizationFilterRequest, res: Response): Promise<Response> {
        try {
            const db = req.app.locals.db as Db;
            const collection = db.collection<Organization>(organizationCollection);

            let response = await collection.aggregate<Organization>([{ $match: { isDeleted: false } }]).toArray();

            const mappedOrgs = response?.reduce((mappedOrgs: any, item: Organization) => {

                mappedOrgs[item.dashboardLink] = mappedOrgs[item.dashboardLink] ||
                {
                    wallets: item.accounts.map(item => ({ address: item.address, network: item.chain }))
                }

                return mappedOrgs;
            }, {})

            return res.status(200).send(mappedOrgs)
        } catch (error) {
            return handleError(res, error)
        }
    }

    async updateOrganization(req: AppRequest, res: Response): Promise<Response> {
        try {
            const db = req.app.locals.db as Db;
            const io = req.app.locals.io as any; //socket connection
            const collection = db.collection(organizationCollection);

            const parsedBody = parseFormData("accounts", req);
            parsedBody.updatedDate = new Date().toDateString();
            await this.attachCommonFields(parsedBody, req)

            const orgId = req.params.id;
            const publicKey = req.headers.address;

            const response = await collection.findOne<Organization>({ _id: new ObjectId(orgId) });
            if (!response) throw new CustomError(ResponseMessage.OrganizationNotFound, ExceptionType.NotFound);

            const isExist = await collection.findOne<Organization>({ dashboardLink: parsedBody.dashboardLink, isDeleted: false })
            if (isExist && !response._id.equals(isExist?._id)) throw new CustomError(ResponseMessage.OrganizationAlreadyExist, ExceptionType.BadRequest);

            const isAccountsSame = compareEnumerable<Account>(response?.accounts, parsedBody.accounts, "address")

            if (isAccountsSame) parsedBody.isActive = true;
            if (!parsedBody.image) parsedBody.image = response.image;
            if (!(req.user?.role === Roles.SuperAdmin || response.createdBy === publicKey))
                throw new CustomError(ResponseMessage.ForbiddenRequest, ExceptionType.UnAuthorized);

            const result = await collection.updateOne(
                { _id: new ObjectId(orgId) },
                { $set: parsedBody }
            );

            parsedBody._id = orgId;
            if (!isAccountsSame && !req.query.removeAnnual) {
                this.fetchOrganizationAnnualBalance(
                    collection,
                    parsedBody,
                    db.collection(organizationHistoricalBalanceCollection),
                    io,
                    result.upsertedId!,
                    req.user.publicKey)
            }

            return res.status(200).send(new AppResponse(200, true, undefined, ResponseMessage.OrganizationUpdated));;
        } catch (error) {
            return handleError(res, error)
        }
    }

    async deleteOrganization(req: AppRequest, res: Response): Promise<Response> {
        try {
            const orgId = req.params.id;
            const publicKey = req.headers.address;
            const db = req.app.locals.db as Db;

            const collection = db.collection(organizationCollection);
            const response = await collection.findOne({ _id: new ObjectId(orgId) });
            if (!response) throw new CustomError(ResponseMessage.OrganizationNotFound, ExceptionType.NotFound);

            if (!(req.user?.role === Roles.SuperAdmin || response.createdBy === publicKey))
                throw new CustomError(ResponseMessage.ForbiddenRequest, ExceptionType.UnAuthorized);;

            const result = await collection.updateOne(
                { _id: new ObjectId(orgId) },
                { $set: { isDeleted: true } }
            );

            return res.status(200).send(new AppResponse(200, true, undefined, result.upsertedId));;
        } catch (error) {
            return handleError(res, error)
        }
    }

    async addFavorites(req: Request, res: Response): Promise<Response> {
        try {
            const orgId = req.params.organizationId;
            const publicKey = req.headers.address;
            if (!orgId || orgId.length > 24)
                throw new CustomError(ResponseMessage.OrganizationIdRequired, ExceptionType.BadRequest);

            const db = req.app.locals.db as Db;
            const orgs = db.collection(organizationCollection);
            const users = db.collection(usersCollection);

            let organization = await orgs.findOne({ _id: new ObjectId(orgId) });
            if (!organization) throw new CustomError(ResponseMessage.OrganizationNotFound, ExceptionType.NotFound);

            users.createIndex({ publicKey: 1 }, { unique: true });

            const aggregation = [
                {
                    $match: {
                        publicKey,
                        [`favoriteOrganizations.${organization._id.toString()}`]: { $exists: true },
                    },
                },
                { $project: { _id: 1 } },
                { $limit: 1 },
            ];
            const update = {} as any

            // Check if organization already exists in favorites
            const existingFavorite = await users.aggregate(aggregation).toArray();

            if (existingFavorite.length > 0)
                update.$unset = { [`favoriteOrganizations.${organization._id.toString()}`]: 1 };
            else update.$set = { [`favoriteOrganizations.${organization._id.toString()}`]: 1 };

            const result = await users.updateOne({ publicKey }, update);

            if (result.acknowledged)
                return res.status(200).send(new AppResponse(200, true, undefined, organization._id));

            throw new CustomError(ResponseMessage.UnknownServerError, ExceptionType.ServerError);
        } catch (error) {
            return handleError(res, error)
        }
    }

    private async attachCommonFields(parsedBody: any, req: Request) {
        parsedBody.image = await this.storageService.uploadByteArray(parsedBody.image);
        parsedBody.networks = {};
        parsedBody.isPrivate = parsedBody.isPrivate.toLowerCase() === 'true';
        parsedBody.isVerified = parsedBody.isVerified.toLowerCase() === 'true';
        parsedBody.isActive = false;
        parsedBody.isDeleted = false;

        Array.from(parsedBody.accounts).forEach((account: any) => {
            if (!parsedBody.networks[account.chain]) {
                parsedBody.networks[account.chain] = account.chain
            }
        })
    }

    private async fetchOrganizationAnnualBalance(
        organizationCollection: Collection<Document>,
        newOrganization: Organization,
        balanceCollection: Collection<Document>,
        io: any,
        createdOrgId: ObjectId,
        userAddress: string) {
        try {
            console.log(new Date());

            let portfolio: Portfolio = {} as any
            let historicalTreasury: TreasuryIndexer = {}
            portfolio.annual = historicalTreasury;
            portfolio.existingTokenLogos = {}

            let walletAddresses: string[] = []
            const { accounts, dashboardLink } = newOrganization;
            const orgObj: OrgObj = { wallets: [] }

            accounts.forEach(account => {
                orgObj.wallets.push({
                    address: account.address,
                    network: account.chain
                })
            })
            await rootParser(orgObj, portfolio, walletAddresses, dashboardLink);

            const htValues = Object.entries(portfolio.annual);

            let responseObj = {
                name: dashboardLink,
                orgId: newOrganization._id,
                addresses: walletAddresses,
                existingTokens: portfolio.existingTokenLogos,
                annual: htValues.length ? htValues
                    .filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 365)
                    .sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1)
                    .reduce<typeof historicalTreasury>((a, c) => { a[c[0]] = c[1]; return a }, {}) : {},
            };

            await balanceCollection.updateOne(
                { orgId: newOrganization._id },
                { $set: responseObj },
                { upsert: true }
            )

            await organizationCollection.updateOne(
                { _id: new ObjectId(newOrganization._id) },
                {
                    $set: {
                        isActive: true,
                        balance: htValues.length ? htValues[0][1].totalTreasury : 0,
                        lastDayBalance: htValues.length ? htValues[1][1].totalTreasury : 0
                    }
                }
            );

            io.emit('annualBalanceFetched', { message: userAddress });
            console.log(new Date());
        } catch (error: any) {
            throw new Error(error);
        }
    }
}

export default OrganizationManager;