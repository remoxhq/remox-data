import express, { type Request, type Response } from 'express'
import { balanceRefresher, fetchAndStoreAnnualBalance, fetchOrgs } from './services';
import { config } from "dotenv"//* Express App
import { MongoClient } from 'mongodb';
import cors from 'cors';

const app = express()
config();
const port = process.env.PORT || 8080
const mongoDbUri = process.env.MONGODB_URI || ""
export const mongoClient = new MongoClient(mongoDbUri)
app.use(cors());

app.route('/fetch/balance').get(async (req: Request, res: Response) => {
    const name = req.query.name;
    const db = mongoClient.db(process.env.DB_NAME);
    const collection = db.collection("OrganizationsHistoricalBalances");
    const response = await collection.findOne({ name });
    res.json(response);
})

app.route('/refresh/balance').get(async (req: Request, res: Response) => {
    await balanceRefresher()
    res.status(200).send("Balance refreshed!");
})

app.route('/orgs/balance/portfolio').get(async (req: Request, res: Response) => {
    const mappedBalanceOfAllDaos = await fetchAndStoreAnnualBalance();
    res.json(mappedBalanceOfAllDaos);
})

app.route('/orgs/active').get(async (req: Request, res: Response) => {
    const list = await fetchOrgs();
    list ? res.status(200).send("Organizations imported!") : res.status(404).send('No organizations found!');
})

app.use(async (req, res, next) => {
    await mongoClient.connect()
    console.log("Connected to MongoDB");
    next()
})

// {
//     origin: ['https://remox-git-dev-remox-dao.vercel.app',
//         'https://app.remox.io',
//         'https://community.remox.io',
//         'http://localhost:3000',
//         'https://localhost:3000'],
//     methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH']
// })

app.listen(port, async () => {
    console.log(`Ready: http://localhost:${port}`)
})