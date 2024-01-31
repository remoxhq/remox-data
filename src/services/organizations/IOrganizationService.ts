import { Request, Response } from "express";
import { OrganizationFilterRequest } from "../../middlewares";

interface IOrganizationService {
    createOrganization(req: Request, res: Response): Promise<Response>;
    getOrganizationByName(req: Request, res: Response): Promise<Response>;
    getAllOrganizations(req: OrganizationFilterRequest, res: Response): Promise<Response>;
    updateOrganization(req: Request, res: Response): Promise<Response>;
    addFavorites(req: Request, res: Response): Promise<Response>;
}

export default IOrganizationService;