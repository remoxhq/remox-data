import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from "inversify";
import { TYPES } from "../utils/types";
import IOrganizationService from '../services/organizations/IOrganizationService';
import { OrganizationFilterRequest } from '../middlewares';
import { AppRequest } from '../models';
import Jwt from "jsonwebtoken";

@injectable()
export class OrganizationController {
    constructor(@inject(TYPES.IOrganizationService) private organizationService: IOrganizationService) { }

    async create(req: AppRequest, res: Response) {
        await this.organizationService.createOrganization(req, res)
    }

    async getByName(req: AppRequest, res: Response, next: NextFunction) {
        await this.organizationService.getOrganizationByName(req, res ,next)
    }

    async getAll(req: OrganizationFilterRequest, res: Response) {
        await this.organizationService.getAllOrganizations(req, res)
    }

    async update(req: AppRequest, res: Response) {
        await this.organizationService.updateOrganization(req, res)
    }

    async delete(req: AppRequest, res: Response) {
        await this.organizationService.deleteOrganization(req, res)
    }

    async addFavorites(req: Request, res: Response) {
        await this.organizationService.addFavorites(req, res)
    }

    async getAllForUpdate(req: AppRequest, res: Response) {
        await this.organizationService.getAllOrgsForDailyUpdate(req, res)
    }
}