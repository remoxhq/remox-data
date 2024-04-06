import { Chain, PortfolioResponse } from "../../libs/covalent"
import { Organization } from "../../libs/firebase-db"
import { config } from "dotenv"
import { Portfolio } from "../../models/treasuries/types";
import axios from "axios";
import { ethers } from "ethers";
import { logos } from "../logos";

config()
const covalentApiKey = process.env.COVALENT_API_KEY || "";

export const rootParser = async (dao: Organization, historicalTreasury: Portfolio, walletAddresses: string[], name?: string) => {
    try {
        for await (const wallet of Object.values(dao.wallets)) {
            walletAddresses.push(wallet.address)

            const { data: walletAnnualPortfolioBalance } = await axios
                .get<{ data: PortfolioResponse }>(`https://api.covalenthq.com/v1/${wallet.network as Chain}/address/${wallet.address}/portfolio_v2/?key=${covalentApiKey}&quote-currency=usd&days=${365}`,)

            walletAnnualPortfolioBalance.data.items?.filter(x => x.contract_name != "Celo native asset").map((token) => {
                token.holdings.forEach((holding, index) => {
                    if (!holding.close.pretty_quote) return;  // skip if there's no pretty_quote value

                    //split date and parse amount
                    const date = holding.timestamp.toString().split("T")[0];
                    const originAmount = holding.close?.quote ?? 0;
                    const tokenBalance = +ethers.utils.formatUnits(holding.close?.balance?.toString() ?? '0', token.contract_decimals);
                    const tokenUsdValue = holding.quote_rate;
                    const amount = originAmount < 0 ? 0 : originAmount
                    const { contract_ticker_symbol, contract_address } = token;
                    const network = wallet.network;

                    let treasuryByDate = historicalTreasury.annual[date] ||
                    {
                        totalTreasury: 0,
                        tokenBalances: {
                            [contract_address]: {
                                balanceUsd: 0,
                                tokenCount: 0,
                                tokenUsdValue
                            }
                        },
                        networkBalances: { [network]: amount }
                    };

                    historicalTreasury.existingTokenLogos[contract_address] = historicalTreasury.existingTokenLogos[contract_address]
                        ||
                    {
                        logo: logos[contract_ticker_symbol?.toLowerCase() ?? ""]?.logoUrl ?? "",
                        symbol: contract_ticker_symbol,
                        chain: wallet.network
                    }

                    treasuryByDate.tokenBalances[contract_address] = treasuryByDate.tokenBalances[contract_address] ||
                    {
                        balanceUsd: 0,
                        tokenCount: 0,
                        tokenUsdValue
                    }
                    treasuryByDate.networkBalances[network] = treasuryByDate.networkBalances[network] || 0
                    treasuryByDate.tokenBalances[contract_address].balanceUsd += amount
                    treasuryByDate.tokenBalances[contract_address].tokenCount += tokenBalance
                    treasuryByDate.totalTreasury += amount;
                    treasuryByDate.networkBalances[network] += amount;

                    historicalTreasury.annual[date] = treasuryByDate;
                });
            })
        }
    } catch (error: any) {
        throw new Error(error);
    }
}
