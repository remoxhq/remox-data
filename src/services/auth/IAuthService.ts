import { Request, Response } from "express";
import { AppRequest, User } from "../../models";

interface IAuthService {
    signIn(req: AppRequest, res: Response): Promise<Response>;
    udpateRole(req: Request, res: Response): Promise<Response>;
    getUserByPublicKey(req: Request, res: Response): Promise<User>;
    getUserByPublicKeyWithOrgs(req: Request, res: Response): Promise<Response>;
}

export default IAuthService;