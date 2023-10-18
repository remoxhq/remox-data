import { MongoClient } from "mongodb";
import { config } from "dotenv";
import { TreasuryIndexer } from "./types";
import { rootParser } from "./root-parser";
import { daos } from "../firebase-db";
import date from 'date-and-time';

config();

export const fetchAndStoreAnnualBalance = async () => {
    try {
        const mongoDbUri = process.env.MONGODB_URI || ""
        const mongoClient = new MongoClient(mongoDbUri)
        await mongoClient.connect()
        const db = mongoClient.db(process.env.DB_NAME);
        const collection = db.collection("OrganizationsHistoricalBalances");
        const mappedBalanceOfAllDaos = await Promise.all(
            Object.keys(daos).map(async (daoName) => {
                if (!daos[daoName]) return;

                let historicalTreasury: TreasuryIndexer = {}
                let walletAddresses: string[] = []

                await rootParser(daos[daoName], historicalTreasury, walletAddresses);

                historicalTreasury = Object.entries(historicalTreasury).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof historicalTreasury>((a, c) => { a[c[0]] = c[1]; return a }, {})

                let responseObj = {
                    name: daoName,
                    addresses: walletAddresses,
                    annual: Object.entries(historicalTreasury).length ? Object.entries(historicalTreasury).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce<typeof historicalTreasury>((a, c) => { a[c[0]] = c[1]; return a; }, {}) : {},
                };

                await collection.insertOne(responseObj)

                return { [daoName]: responseObj }
            })
        )

        return mappedBalanceOfAllDaos;
    } catch (error: any) {
        throw new Error(error);
    }
}