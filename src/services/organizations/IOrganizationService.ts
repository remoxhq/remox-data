import { Request, Response } from "express";

interface IOrganizationService {
    createOrganization(req: Request, res: Response): Promise<Response>;
    getOrganizationByName(req: Request, res: Response): Promise<Response>;
    getAllOrganizations(req: Request, res: Response): Promise<Response>;
}

export default IOrganizationService;