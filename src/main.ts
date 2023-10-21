import express, { type Request, type Response } from 'express'
import { balanceRefresher, fetchAndStoreAnnualBalance, fetchOrgs } from './services';
import { config } from "dotenv"//* Express App
import { MongoClient, ObjectId } from 'mongodb';
import axios from 'axios';
import { parse } from 'path/posix';

const app = express()
config();
const port = process.env.PORT || 8080
const mongoDbUri = process.env.MONGODB_URI || ""
export const mongoClient = new MongoClient(mongoDbUri)

app.route('/fetch/borrowrates').get(async (req: Request, res: Response) => {

    const lendingToken = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";
    // const lendingTokenEvents = await axios.get(`https://etherscan.io/address/${lendingToken}#events`)
    const lendingTokenEvents = await axios.get(`https://api.covalenthq.com/v1/1/events/topics/0x804c9b842b2748a22bb64b345453a3de7ca54a6ca45ce00d415894979e22897a/?starting-block=12150179&ending-block=12150779&key=${process.env.COVALENT_API_KEY}&quote-currency=USD&key-query=topics&key-query-opts=topics-opr%3D%3D&sender-address=${lendingToken}&receiver-address=$}`)
    const brs: string[] = [];

    Array.from(lendingTokenEvents.data.data.items).map((item: any) => {

        if (Array.from(item.raw_log_topics).some((topic) => topic === "0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")) {
            Array.from(item.decoded.params).map((log: any) => {

                if (log.name === 'variableBorrowRate') {
                    const br = parseFloat(log.value) / Math.pow(10, 27);
                    brs.push(br.toString());
                }
            })
        }
    })
    res.json(brs);
})

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

app.listen(port, async () => {
    console.log(`Ready: http://localhost:${port}`)
})