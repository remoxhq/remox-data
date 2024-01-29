import { Request, Response } from "express";

interface IAuthService {
    signIn(req: Request, res: Response): Promise<Response>;
    udpateRole(req: Request, res: Response): Promise<Response>;
}

export default IAuthService;