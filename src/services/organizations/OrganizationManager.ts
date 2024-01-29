import { inject, injectable } from "inversify";
import IOrganizationService from "./IOrganizationService";
import { Request, Response } from "express";
import { parseFormData } from "../../utils";
import { Db } from "mongodb";
import { ResponseMessage, TYPES } from "../../utils/types";
import IStorageService from "../storage/IStorageService";
import { Pagination } from "../../models";

const organizationCollection = "Organizations"

@injectable()
class OrganizationManager implements IOrganizationService {
    constructor(@inject(TYPES.IStorageService) private storageService: IStorageService) { }

    async createOrganization(req: Request, res: Response): Promise<Response> {
        let parsedBody = parseFormData("accounts", req);
        parsedBody.createdDate = new Date().toDateString();
        await this.attachCommonFields(parsedBody);

        const db = req.app.locals.db as Db;
        const collection = db.collection(organizationCollection);
        await collection.insertOne(parsedBody)

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

    async getAllOrganizations(req: Request, res: Response): Promise<Response> {
        const pageIndex = parseInt(req.query.pageIndex as string, 10) || 1;
        const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
        const filter = req.filter;
        const db = req.app.locals.db as Db;

        const collection = db.collection(organizationCollection);
        const response = await collection.find(filter).skip((pageIndex - 1) * pageSize).limit(pageSize).toArray();
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
}

export default OrganizationManager;