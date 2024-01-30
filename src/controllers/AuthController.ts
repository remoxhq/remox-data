import { Request, Response } from 'express'
import { inject, injectable } from "inversify";
import { TYPES } from "../utils/types";
import IAuthService from '../services/auth/IAuthService';

@injectable()
export class AuthController {
    constructor(@inject(TYPES.IAuthService) private authService: IAuthService) { }

    async signIn(req: Request, res: Response) {
        await this.authService.signIn(req, res)
    }

    async updateRole(req: Request, res: Response) {
        await this.authService.udpateRole(req, res)
    }

    async getUserFavOrgs(req: Request, res: Response) {
        await this.authService.getUserByPublicKeyWithOrgs(req, res)
    }
}