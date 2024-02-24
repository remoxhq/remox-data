import { MongoClient } from "mongodb";
import { config } from "dotenv";
import { rootParser } from "./root-parser";
import { daos } from "../../libs/firebase-db";
import date from 'date-and-time';
import { TreasuryIndexer } from "../../models/treasuries/types";

config();

export const fetchAndStoreAnnualBalance = async () => {
    try {
        const mongoDbUri = process.env.MONGODB_URI || ""
        const mongoClient = new MongoClient(mongoDbUri)
        await mongoClient.connect()
        const db = mongoClient.db(process.env.DB_NAME);
        const storedOrgsMap = new Map<string, string>()
        const collection = db.collection("OrganizationsHistoricalBalances");

        const query = {
            name: {
                $in: Object.keys(daos),
            },
        };
        const projection = { _id: 0, name: 1 }

        const storedOrgs = await collection.find(query, { projection }).toArray();

        storedOrgs.forEach((item, index) => {
            storedOrgsMap.set(item.name, item.name)
        })

        await Promise.all(Object.keys(daos).map(async (daoName, index) => {
            if (!daos[daoName] || storedOrgsMap.get(daoName)) return;

            let historicalTreasury: TreasuryIndexer = {}
            let walletAddresses: string[] = []

            await rootParser(daos[daoName], historicalTreasury, walletAddresses, daoName);

            historicalTreasury = Object.entries(historicalTreasury).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof historicalTreasury>((a, c) => { a[c[0]] = c[1]; return a }, {})

            let responseObj = {
                name: daoName,
                addresses: walletAddresses,
                annual: Object.entries(historicalTreasury).length ? Object.entries(historicalTreasury).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce<typeof historicalTreasury>((a, c) => { a[c[0]] = c[1]; return a; }, {}) : {},
            };

            await collection.insertOne(responseObj)

            return { [daoName]: responseObj }
        }))
        return {};
    } catch (error: any) {
        throw new Error(error);
    }
}