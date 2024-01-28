import { Request, Response } from 'express'
import { inject, injectable } from "inversify";
import { TYPES } from "../utils/types";
import OrganizationManager from "../services/organizations/OrganizationManager";
import { CustomError, ExceptionType } from '../models';

@injectable()
export class OrganizationController {
    constructor(@inject(TYPES.IOrganizationService) private organizationService: OrganizationManager) { }

    async create(req: Request, res: Response) {
        res.send(req.body);
    }
}