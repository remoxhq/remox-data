import express, { type Request, type Response } from 'express'
import { config } from "dotenv"//* Express App
import { db, Organizations, daos } from './firebase-db';
import { DocumentData, collection, doc, getDoc, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import { Chain, CovalentClient } from '@covalenthq/client-sdk';
import { MongoClient } from 'mongodb';
import { TokenDataByDate, covalentNetworks } from './covalent';
import date from 'date-and-time';

const app = express()
config();
const port = process.env.PORT || 8080
const mongoDbUri = process.env.MONGODB_URI || ""
const covalentApiKey = process.env.COVALENT_API_KEY || ""

app.route('/orgs/balance/portfolio').get(async (req: Request, res: Response) => {
    const covalentClient = new CovalentClient(covalentApiKey);
    const mongoClient = new MongoClient(mongoDbUri)
    await mongoClient.connect()
    const db = mongoClient.db(process.env.DB_NAME);

    const mappedBalanceOfAllDaos = await Promise.all(
        Object.keys(daos).map(async (daoName) => {
            if (!daos[daoName]) return;

            let totalsByDate: TokenDataByDate = {}

            const mappedProtfolioBalanceData = await Promise.all(
                daos[daoName].addresses.map(async (address) => {
                    const walletAnnualPortfolioBlance = await covalentClient.BalanceService.getHistoricalPortfolioForWalletAddress(
                        daos[daoName].network as Chain,
                        address,
                        {
                            quoteCurrency: 'USD',
                            days: 365,
                        }
                    )

                    walletAnnualPortfolioBlance.data.items.map((token) => {
                        token.holdings.forEach((holding, index: any) => {
                            if (!holding.close.pretty_quote || index === 0) return;  // skip if there's no pretty_quote value

                            //split date and parse amount
                            const date = holding.timestamp.toISOString().split("T")[0];
                            const originAmount = holding.close?.quote ?? 0;
                            const amount = originAmount < 0 ? 0 : originAmount
                            // const amount =holding.close?.quote ?? 0

                            if (!totalsByDate[date])
                                totalsByDate[date] = 0;

                            totalsByDate[date] += amount;
                        });
                    })

                    totalsByDate = Object.entries(totalsByDate).sort(([key1], [key2]) => new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce<typeof totalsByDate>((a, c) => { a[c[0]] = c[1]; return a }, {})

                    // filter by date
                    let responseObj = {
                        week: Object.entries(totalsByDate).length ? Object.entries(totalsByDate).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 7).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}) : {},
                        month: Object.entries(totalsByDate).length ? Object.entries(totalsByDate).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 31).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}) : {},
                        quart: Object.entries(totalsByDate).length ? Object.entries(totalsByDate).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 90).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}) : {},
                        year: Object.entries(totalsByDate).length ? Object.entries(totalsByDate).filter(([time, amount]) => Math.abs(date.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce<{ [name: string]: number }>((a, c) => { a[c[0]] = c[1]; return a; }, {}) : {},
                    };

                    return responseObj;
                })
            )

            return { [daoName]: mappedProtfolioBalanceData }
        })
    )

    res.json(mappedBalanceOfAllDaos);
})

app.route('/orgs/active').get(async (req: Request, res: Response) => {
    const organizationCollection = 'organizations';
    const accountCollection = 'accounts';
    const querySnapshot = await getDocs(collection(db, organizationCollection));

    const list: Organizations = {};

    await Promise.all(querySnapshot.docs.map(async (document: any) => {
        const orgData = document.data();
        await Promise.all(Array.from(orgData.accounts).map(async (item: any) => {
            const docRef = doc(db, accountCollection, item.id);
            const docSnap = await getDoc(docRef) as DocumentData;
            const accountData = docSnap.data();

            if (!list[orgData.name])
                list[orgData.name] = { network: covalentNetworks[accountData.blockchain], addresses: [accountData.address] }
            else
                list[orgData.name] = { network: covalentNetworks[accountData.blockchain], addresses: [...list[orgData.name].addresses, accountData.address] }
        }));
    }));

    if (!list)
        res.json({ error: 'No organizations found' });

    const jsonString = JSON.stringify(list, null, 2);
    const filePath = './orgs.json';
    fs.writeFileSync(filePath, jsonString, 'utf-8');

    res.json(list);
})

app.listen(port, () => {
    console.log(`Ready: http://localhost:${port}`)
})