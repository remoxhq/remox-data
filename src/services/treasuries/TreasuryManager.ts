import { Request } from 'express'
import { injectable } from "inversify";
import ITreasuryService from "./ITreasuryService";
import { Db } from "mongodb";

const tresuryCollection = "OrganizationsHistoricalBalances";

@injectable()
class TreasuryManager implements ITreasuryService {

    async getAnnualTreasury(req: Request) {
        const orgName = req.params.name;
        if (!orgName) return;

        const db = req.app.locals.db as Db;
        const collection = db.collection(tresuryCollection);
        const response = await collection.findOne({ name: orgName });
        return response;
    }
}

export default TreasuryManager;