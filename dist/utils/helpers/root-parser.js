"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "rootParser", {
    enumerable: true,
    get: function() {
        return rootParser;
    }
});
const _dotenv = require("dotenv");
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
const _ethers = require("ethers");
const _logos = require("../logos");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
(0, _dotenv.config)();
const covalentApiKey = process.env.COVALENT_API_KEY || "";
const rootParser = async (dao, historicalTreasury, walletAddresses, name)=>{
    try {
        for await (const wallet of Object.values(dao.wallets)){
            walletAddresses.push(wallet.address);
            const { data: walletAnnualPortfolioBalance } = await _axios.default.get(`https://api.covalenthq.com/v1/${wallet.network}/address/${wallet.address}/portfolio_v2/?key=${covalentApiKey}&quote-currency=usd&days=${365}`);
            walletAnnualPortfolioBalance.data.items?.map((token)=>{
                token.holdings.forEach((holding, index)=>{
                    if (!holding.close.pretty_quote) return; // skip if there's no pretty_quote value
                    //split date and parse amount
                    const date = holding.timestamp.toString().split("T")[0];
                    const originAmount = holding.close?.quote ?? 0;
                    const tokenBalance = +_ethers.ethers.utils.formatUnits(holding.close?.balance?.toString() ?? '0', token.contract_decimals);
                    const tokenUsdValue = holding.quote_rate;
                    const amount = originAmount < 0 ? 0 : originAmount;
                    const { contract_ticker_symbol, contract_address } = token;
                    const network = wallet.network;
                    let treasuryByDate = historicalTreasury.annual[date] || {
                        totalTreasury: 0,
                        tokenBalances: {
                            [contract_address]: {
                                balanceUsd: 0,
                                tokenCount: 0,
                                tokenUsdValue
                            }
                        },
                        networkBalances: {
                            [network]: amount
                        }
                    };
                    historicalTreasury.existingTokenLogos[contract_address] = historicalTreasury.existingTokenLogos[contract_address] || {
                        logo: _logos.logos[contract_ticker_symbol?.toLowerCase() ?? ""]?.logoUrl ?? "",
                        symbol: contract_ticker_symbol
                    };
                    treasuryByDate.tokenBalances[contract_address] = treasuryByDate.tokenBalances[contract_address] || {
                        balanceUsd: 0,
                        tokenCount: 0,
                        tokenUsdValue
                    };
                    treasuryByDate.networkBalances[network] = treasuryByDate.networkBalances[network] || 0;
                    treasuryByDate.tokenBalances[contract_address].balanceUsd += amount;
                    treasuryByDate.tokenBalances[contract_address].tokenCount += tokenBalance;
                    treasuryByDate.totalTreasury += amount;
                    treasuryByDate.networkBalances[network] += amount;
                    if (contract_ticker_symbol === "USDT") {
                        console.log(date);
                        console.log(treasuryByDate.tokenBalances[contract_address].balanceUsd);
                        console.log(holding.close?.balance);
                        console.log(token.contract_decimals);
                        console.log(+_ethers.ethers.utils.formatUnits(holding.close?.balance?.toString() ?? '0', token.contract_decimals));
                        console.log("##################################");
                    }
                    historicalTreasury.annual[date] = treasuryByDate;
                });
            });
        }
    } catch (error) {
        throw new Error(error);
    }
};
