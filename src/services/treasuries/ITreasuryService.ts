import { Request } from 'express'
interface ITreasuryService {
    getAnnualTreasury(req: Request): any;
}

export default ITreasuryService;