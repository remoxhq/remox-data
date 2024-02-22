"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    covalentPortfolioRequest: function() {
        return covalentPortfolioRequest;
    },
    moralisTransactionsRequest: function() {
        return moralisTransactionsRequest;
    }
});
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
const _dotenv = require("dotenv");
const _moralis = /*#__PURE__*/ _interop_require_default(require("moralis"));
_export_star(require("./covalent-networks"), exports);
_export_star(require("./types"), exports);
_export_star(require("@covalenthq/client-sdk"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
(0, _dotenv.config)();
const covalentPortfolioRequest = async (wallet)=>{
    return await _axios.default.get(`https://api.covalenthq.com/v1/${wallet.chain}/address/${wallet.address}/balances_v2/?key=${process.env.COVALENT_API_KEY}`);
};
const moralisTransactionsRequest = async (wallet)=>{
    await _moralis.default.start({
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjRjMzU4NGVhLTVlNjUtNDkzMS05NTE3LWFmMzE2NTYyNTcyNyIsIm9yZ0lkIjoiMzc4Mjc3IiwidXNlcklkIjoiMzg4NzI3IiwidHlwZUlkIjoiYTIzNzk4MWUtODMzNi00ZGIwLWFhNjYtNDZmMTc3OWNlYjViIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDg0Mzg5MzUsImV4cCI6NDg2NDE5ODkzNX0.RNjCuBGn7fDO5KYkMOBRPNLYlgCpJktEzk05e5dDFb8'
    });
    const response = await _moralis.default.EvmApi.transaction.getWalletTransactionsVerbose({
        "chain": wallet.chain,
        "limit": 20,
        "address": wallet.address
    });
    return response;
};
