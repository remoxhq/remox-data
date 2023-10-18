import express, { type Request, type Response } from 'express'
import { fetchAndStoreAnnualBalance, fetchOrgs } from './services';
import { config } from "dotenv"//* Express App
import { MongoClient } from 'mongodb';

const app = express()
config();
const port = process.env.PORT || 8080

app.route('/fetch/balance').get(async (req: Request, res: Response) => {
    const mongoDbUri = process.env.MONGODB_URI || ""
    const mongoClient = new MongoClient(mongoDbUri)
    await mongoClient.connect()
    const db = mongoClient.db(process.env.DB_NAME);
    const collection = db.collection("OrganizationsHistoricalBalances");

    const response = await collection.findOne({ name: 'Aave' })
    await mongoClient.close()
    res.json(response);
})

app.route('/orgs/balance/portfolio').get(async (req: Request, res: Response) => {
    const mappedBalanceOfAllDaos = await fetchAndStoreAnnualBalance();
    res.json(mappedBalanceOfAllDaos);
})

app.route('/orgs/active').get(async (req: Request, res: Response) => {
    const list = await fetchOrgs();
    list ? res.status(200).send("Organizations imported!") : res.status(404).send('No organizations found!');
})

app.listen(port, () => {
    console.log(`Ready: http://localhost:${port}`)
})