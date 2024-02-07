import { CovalentClient, Chain } from "../libs/covalent"
import { Organization } from "../libs/firebase-db"
import { config } from "dotenv"
import { TreasuryIndexer } from "../models/treasuries/types";

config()
const covalentApiKey = process.env.COVALENT_API_KEY || "";

export const rootParser = async (dao: Organization, historicalTreasury: TreasuryIndexer, walletAddresses: string[], name?: string) => {
    try {
        console.log("############Root Parser#############");
        console.log(covalentApiKey);
        const covalentClient = new CovalentClient(covalentApiKey);
        for await (const wallet of Object.values(dao.wallets)) {
            walletAddresses.push(wallet.address)

            const walletAnnualPortfolioBalance = await covalentClient.BalanceService.getHistoricalPortfolioForWalletAddress(
                wallet.network as Chain,
                wallet.address,
                {
                    quoteCurrency: 'USD',
                    days: 365,
                }
            )

            walletAnnualPortfolioBalance.data.items?.map((token) => {
                token.holdings.forEach((holding, index) => {
                    if (!holding.close.pretty_quote || index === 0) return;  // skip if there's no pretty_quote value

                    //split date and parse amount
                    const date = holding.timestamp.toISOString().split("T")[0];
                    const originAmount = holding.close?.quote ?? 0;
                    const amount = originAmount < 0 ? 0 : originAmount
                    const { contract_ticker_symbol } = token;
                    const network = wallet.network;
                    let treasuryByDate = historicalTreasury[date];

                    if (!treasuryByDate) {
                        treasuryByDate = {
                            totalTreasury: amount,
                            tokenBalances: { [contract_ticker_symbol]: amount },
                            networkBalances: { [network]: amount }
                        }
                    }
                    else {
                        treasuryByDate.totalTreasury += amount;
                        treasuryByDate.tokenBalances[contract_ticker_symbol] = (historicalTreasury[date].tokenBalances[contract_ticker_symbol] || 0) + amount;
                        treasuryByDate.networkBalances[network] = (historicalTreasury[date].networkBalances[network] || 0) + amount;
                    }

                    historicalTreasury[date] = treasuryByDate;
                });
            })
        }
    } catch (error: any) {
        throw new Error(error);
    }
}
