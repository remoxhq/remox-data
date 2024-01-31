import { Request, Response } from 'express'
import { inject, injectable } from "inversify";
import { TYPES } from "../utils/types";
import IOrganizationService from '../services/organizations/IOrganizationService';
import { OrganizationFilterRequest } from '../middlewares';

@injectable()
export class OrganizationController {
    constructor(@inject(TYPES.IOrganizationService) private organizationService: IOrganizationService) { }

    async create(req: Request, res: Response) {
        await this.organizationService.createOrganization(req, res)
    }

    async getByName(req: Request, res: Response) {
        await this.organizationService.getOrganizationByName(req, res)
    }

    async getAll(req: OrganizationFilterRequest, res: Response) {
        await this.organizationService.getAllOrganizations(req, res)
    }

    async update(req: Request, res: Response) {
        await this.organizationService.updateOrganization(req, res)
    }

    async addFavorites(req: Request, res: Response) {
        await this.organizationService.addFavorites(req, res)
    }
}