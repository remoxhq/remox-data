import { Request, Response } from 'express'
interface ITreasuryService {
    getAnnualTreasury(req: Request): any;
    getAssets(req: Request, res: Response): Promise<Response>;
}

export default ITreasuryService;