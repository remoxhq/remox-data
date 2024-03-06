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
    covalentTxnRequest: function() {
        return covalentTxnRequest;
    },
    moralisRequest: function() {
        return moralisRequest;
    }
});
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
const _models = require("../../models");
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
const covalentTxnRequest = async (wallet, page)=>{
    return await _axios.default.get(page ? page + `?quote-currency=usd&key=${process.env.COVALENT_API_KEY}` : `https://api.covalenthq.com/v1/${wallet.chain}/address/${wallet.address}/transactions_v3/?quote-currency=usd&key=${process.env.COVALENT_API_KEY}`);
};
const moralisRequest = async (wallet, page, type)=>{
    if (!_moralis.default.Core.isStarted) {
        await _moralis.default.start({
            apiKey: process.env.MORALIS_API_KEY
        });
    }
    const query = {
        chain: _models.Coins[wallet.chain].hexId,
        limit: 25,
        address: wallet.address,
        cursor: page
    };
    const execute = {
        ["Transfer"]: async ()=>await _moralis.default.EvmApi.token.getWalletTokenTransfers(query),
        ["Native"]: async ()=>await _moralis.default.EvmApi.transaction.getWalletTransactions(query)
    };
    const response = await execute[type]();
    return response;
};
