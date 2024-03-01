import { Request, Response } from 'express'
interface ITreasuryService {
    getAnnualTreasury(req: Request, res: Response): Promise<Response>;
    getAssets(req: Request, res: Response): Promise<Response>;
    getTransactions(req: Request, res: Response): Promise<Response>;
}

export default ITreasuryService;