import { Request, Response } from "express";
import { User } from "../../models";

interface IAuthService {
    signIn(req: Request, res: Response): Promise<Response>;
    udpateRole(req: Request, res: Response): Promise<Response>;
    getUserByPublicKey(req: Request, res: Response): Promise<User>;
    getUserByPublicKeyWithOrgs(req: Request, res: Response): Promise<Response>;
}

export default IAuthService;