import { Request, Response } from 'express'
import { inject, injectable } from "inversify";
import { TYPES } from "../utils/types";
import ITreasuryService from "../services/treasuries/ITreasuryService";

@injectable()
export class TreasuryController {
    constructor(@inject(TYPES.ITreasuryService) private treasuryService: ITreasuryService) { }

    async getAnnualTreasury(req: Request, res: Response) {
        const response = await this.treasuryService.getAnnualTreasury(req);
        res.send(response);
    }
}
