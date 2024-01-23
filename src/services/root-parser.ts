import { CovalentClient, Chain } from "../covalent"
import { Organization } from "../firebase-db"
import { config } from "dotenv"
import { TreasuryIndexer } from "./types";

config()
const covalentApiKey = process.env.COVALENT_API_KEY || "";

export const rootParser = async (dao: Organization, historicalTreasury: TreasuryIndexer, walletAddresses: string[], name?: string) => {
    try {
        const covalentClient = new CovalentClient(covalentApiKey);

        await Promise.all(
            dao.wallets.map(async (wallet) => {
                walletAddresses.push(wallet.address)

                const walletAnnualPortfolioBalance = await covalentClient.BalanceService.getHistoricalPortfolioForWalletAddress(
                    wallet.network as Chain,
                    wallet.address,
                    {
                        quoteCurrency: 'USD',
                        days: 365,
                    }
                )

                console.log(name);

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

                console.log(name + "1");
            })
        )
    } catch (error: any) {
        throw new Error(error);
    }
}
