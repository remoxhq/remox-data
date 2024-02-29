import { Chain, PortfolioResponse } from "../../libs/covalent"
import { Organization } from "../../libs/firebase-db"
import { config } from "dotenv"
import { TreasuryIndexer } from "../../models/treasuries/types";
import axios from "axios";
import { ethers } from "ethers";

config()
const covalentApiKey = process.env.COVALENT_API_KEY || "";

export const rootParser = async (dao: Organization, historicalTreasury: TreasuryIndexer, walletAddresses: string[], name?: string) => {
    try {
        for await (const wallet of Object.values(dao.wallets)) {
            walletAddresses.push(wallet.address)

            const { data: walletAnnualPortfolioBalance } = await axios
                .get<{ data: PortfolioResponse }>(`https://api.covalenthq.com/v1/${wallet.network as Chain}/address/${wallet.address}/portfolio_v2/?key=${covalentApiKey}&quote-currency=usd&days=${365}`,)

            console.log(walletAnnualPortfolioBalance.data.items[0].holdings.length);
            console.log(walletAnnualPortfolioBalance.data.items[1].holdings.length);
            walletAnnualPortfolioBalance.data.items?.map((token) => {
                token.holdings.forEach((holding, index) => {
                    if (!holding.close.pretty_quote) return;  // skip if there's no pretty_quote value

                    //split date and parse amount
                    const date = holding.timestamp.toString().split("T")[0];
                    const originAmount = holding.close?.quote ?? 0;
                    const tokenBalance = ethers.utils.formatUnits(holding.close?.balance?.toString() ?? '0', token.contract_decimals);
                    const tokenUsdValue = holding.quote_rate;
                    const amount = originAmount < 0 ? 0 : originAmount
                    const { contract_ticker_symbol } = token;
                    const network = wallet.network;

                    let treasuryByDate = historicalTreasury[date] ||
                    {
                        totalTreasury: 0,
                        tokenBalances: {
                            [contract_ticker_symbol]: {
                                balanceUsd: 0,
                                tokenCount: 0,
                                tokenUsdValue
                            }
                        },
                        networkBalances: { [network]: amount }
                    };

                    treasuryByDate.tokenBalances[contract_ticker_symbol] = treasuryByDate.tokenBalances[contract_ticker_symbol] ||
                    {
                        balanceUsd: 0,
                        tokenCount: 0,
                        tokenUsdValue
                    }

                    treasuryByDate.networkBalances[network] = treasuryByDate.networkBalances[network] || amount
                    treasuryByDate.tokenBalances[contract_ticker_symbol].balanceUsd += amount
                    treasuryByDate.tokenBalances[contract_ticker_symbol].tokenCount += + tokenBalance
                    treasuryByDate.totalTreasury += amount;
                    treasuryByDate.networkBalances[network] += amount;

                    historicalTreasury[date] = treasuryByDate;
                });
            })
        }
    } catch (error: any) {
        throw new Error(error);
    }
}
