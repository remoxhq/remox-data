import 'reflect-metadata';
import express, { Response, Request } from 'express'
import { config } from "dotenv"
import { startServer } from './utils';
const app = express()

// const coinGeckoApi = axios.create({
//     baseURL: 'https://pro-api.coingecko.com/api/v3',
//     headers: {
//         'x-cg-pro-api-key': 'CG-f4bXrXR2BJi3CR1Jyp82ChNt'
//     }
// });

// app.get("/getLogos", async (req: Request, res: Response) => {

//     const fakeArray: number[] = []


//     for (let index = 0; index < 53; index++) {
//         fakeArray.push(index)
//     }
//     const mappedTokens: MappedTokens = {}

//     await Promise.all(
//         fakeArray.map(async (item: any, index: number) => {
//             const response = await coinGeckoApi.get(`/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${index}&sparkline=false&locale=en`);


//             Array.from(response.data).forEach((item: any) => {
//                 mappedTokens[item.symbol] = mappedTokens[item.symbol] || { logoUrl: item.image.toString().replace("large", "small"), symbol: item.symbol }
//             }
//             )

//             const jsonString = JSON.stringify(mappedTokens, null, 2);
//             const filePath = './orgs.json';
//             fs.writeFileSync(filePath, jsonString, 'utf-8');
//         })
//     )

//     console.log(new Date());

//     res.send("Shit!")

// })
config(); // env files configuration
startServer(app);
