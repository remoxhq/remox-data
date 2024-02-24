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
                    if (!holding.close.pretty_quote || index === 0) return; // skip if there's no pretty_quote value
                    //split date and parse amount
                    const date = holding.timestamp.toString().split("T")[0];
                    const originAmount = holding.close?.quote ?? 0;
                    const amount = originAmount < 0 ? 0 : originAmount;
                    const { contract_ticker_symbol } = token;
                    const network = wallet.network;
                    let treasuryByDate = historicalTreasury[date];
                    if (!treasuryByDate) {
                        treasuryByDate = {
                            totalTreasury: amount,
                            tokenBalances: {
                                [contract_ticker_symbol]: amount
                            },
                            networkBalances: {
                                [network]: amount
                            }
                        };
                    } else {
                        treasuryByDate.totalTreasury += amount;
                        treasuryByDate.tokenBalances[contract_ticker_symbol] = (historicalTreasury[date].tokenBalances[contract_ticker_symbol] || 0) + amount;
                        treasuryByDate.networkBalances[network] = (historicalTreasury[date].networkBalances[network] || 0) + amount;
                    }
                    historicalTreasury[date] = treasuryByDate;
                });
            });
        }
    } catch (error) {
        throw new Error(error);
    }
};
