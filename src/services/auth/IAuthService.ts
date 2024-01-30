import { Request, Response } from "express";

interface IAuthService {
    signIn(req: Request, res: Response): Promise<Response>;
    udpateRole(req: Request, res: Response): Promise<Response>;
    getUserByPublicKey(req: Request, res: Response): Promise<any>;
    getUserByPublicKeyWithOrgs(req: Request, res: Response): Promise<Response>;
}

export default IAuthService;