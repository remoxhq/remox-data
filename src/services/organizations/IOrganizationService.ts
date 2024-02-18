import { Request, Response } from "express";
import { OrganizationFilterRequest } from "../../middlewares";
import { AppRequest } from "../../models";

interface IOrganizationService {
    createOrganization(req: AppRequest, res: Response): Promise<Response>;
    getOrganizationByName(req: Request, res: Response): Promise<Response>;
    getAllOrganizations(req: OrganizationFilterRequest, res: Response): Promise<Response>;
    updateOrganization(req: AppRequest, res: Response): Promise<Response>;
    deleteOrganization(req: AppRequest, res: Response): Promise<Response>;
    addFavorites(req: Request, res: Response): Promise<Response>;
}

export default IOrganizationService;