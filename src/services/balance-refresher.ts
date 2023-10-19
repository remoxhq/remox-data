import { config } from "dotenv";
import { Chain, CovalentClient } from "../covalent";
import { daos } from "../firebase-db";
import { TreasuryIndexer } from "./types";
import { mongoClient } from "../main";

config()
const covalentApiKey = process.env.COVALENT_API_KEY || "";

interface UpdateData {
    [key: string]: any;
}

export const balanceRefresher = async () => {
    const covalentClient = new CovalentClient(covalentApiKey);
    try {
        await Promise.all(Object.values(daos).map(async (dao, index) => {
            const { wallets } = dao;

            let historicalTreasury: TreasuryIndexer = {}

            await Promise.all(wallets.map(async (wallet) => {
                const walletAnnualPortfolioBalance = await covalentClient.BalanceService.getHistoricalPortfolioForWalletAddress(
                    wallet.network as Chain,
                    wallet.address,
                    {
                        quoteCurrency: 'USD',
                        days: 0,
                    }
                )
                walletAnnualPortfolioBalance.data.items.map((token) => {
                    const holding = token.holdings[0];
                    if (!holding.close.pretty_quote) return;  // skip if there's no pretty_quote value

                    //split date and parse amount
                    const date = holding.timestamp.toISOString().split("T")[0];
                    const originAmount = holding.close?.quote ?? 123456;
                    const amount = originAmount < 0 ? 0 : originAmount
                    const { contract_ticker_symbol } = token;
                    const network = wallet.network;

                    if (!historicalTreasury[date]) {
                        historicalTreasury[date] = {
                            totalTreasury: amount,
                            tokenBalances: { [contract_ticker_symbol]: amount },
                            networkBalances: { [network]: amount }
                        }
                    }
                    else {
                        historicalTreasury[date].totalTreasury += amount;
                        historicalTreasury[date].tokenBalances[contract_ticker_symbol] = (historicalTreasury[date].tokenBalances[contract_ticker_symbol] || 0) + amount;
                        historicalTreasury[date].networkBalances[network] = (historicalTreasury[date].networkBalances[network] || 0) + amount;
                    }
                });
            }))

            const filter = {
                name: Object.keys(daos)[index]
            }
            const newHistoricalTreasury = Object.keys(historicalTreasury)[0]

            const update = {
                $set: {
                    [`annual.${newHistoricalTreasury}`]: historicalTreasury[newHistoricalTreasury],
                },
            };

            const options = { upsert: true }
            await mongoClient.db(process.env.DB_NAME).collection('OrganizationsHistoricalBalances').updateOne(filter, update, options)
        }))
    } catch (error: any) {
        throw new Error(error.message);
    }
};