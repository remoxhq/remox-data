import { Request, Response } from 'express'
import { inject, injectable } from "inversify";
import { TYPES } from "../utils/types";
import OrganizationManager from "../services/organizations/OrganizationManager";
import { Account, Organization } from '../models';
import { parseFormData } from '../utils';

@injectable()
export class OrganizationController {
    constructor(@inject(TYPES.IOrganizationService) private organizationService: OrganizationManager) { }

    async create(req: Request<Organization>, res: Response) {

        const parserdBody = parseFormData<Account>(req.body as Organization, "accounts");
        if (req.files)
            parserdBody['image' as keyof Account] = req.files[0 as keyof {}];

        res.send(parserdBody);
    }
}