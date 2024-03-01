import { Request, Response } from 'express'
import { inject, injectable } from "inversify";
import { TYPES } from "../utils/types";
import ITreasuryService from "../services/treasury/ITreasuryService";

@injectable()
export class TreasuryController {
    constructor(@inject(TYPES.ITreasuryService) private treasuryService: ITreasuryService) { }

    async getAnnualTreasury(req: Request, res: Response) {
        await this.treasuryService.getAnnualTreasury(req, res);
    }

    async getAssets(req: Request, res: Response) {
        await this.treasuryService.getAssets(req, res);
    }

    async getTransactions(req: Request, res: Response) {
        await this.treasuryService.getTransactions(req, res);
    }
}
