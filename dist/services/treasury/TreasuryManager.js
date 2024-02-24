"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _inversify = require("inversify");
const _models = require("../../models");
const _types = require("../../utils/types");
const _covalent = require("../../libs/covalent");
const _ethers = require("ethers");
const _responseHandler = require("../../utils/helpers/responseHandler");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const tresuryCollection = "OrganizationsHistoricalBalances";
class TreasuryManager {
    async getAnnualTreasury(req, res) {
        try {
            const orgName = req.params.name;
            const db = req.app.locals.db;
            const collection = db.collection(tresuryCollection);
            const response = await collection.findOne({
                name: orgName
            });
            if (!response) throw new _models.CustomError(_types.ResponseMessage.OrganizationNotFound, _models.ExceptionType.NotFound);
            return res.status(200).send(new _models.AppResponse(200, true, undefined, response));
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    }
    async getAssets(req, res) {
        try {
            const totalAssets = await this.getAssetsFromProvider(req);
            return res.status(200).send(new _models.AppResponse(200, true, undefined, totalAssets));
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    }
    async getTransactions(req, res) {
        try {
            const txs = await this.getTransactionsFromProvider(req);
            return res.status(200).send(new _models.AppResponse(200, true, undefined, txs));
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    }
    async getTransactionsFromProvider(req) {
        const wallets = req.body["wallets"];
        if (!Array.isArray(wallets)) throw new _models.CustomError(_types.ResponseMessage.WalletsMustBeArray, _models.ExceptionType.BadRequest);
        let totalTxs = [];
        await Promise.all(wallets.map(async (wallet)=>{
            const walletTransfersReq = (0, _covalent.moralisRequest)(wallet, "Transfer");
            const walletativeTxnsReq = (0, _covalent.moralisRequest)(wallet, "Native");
            const [walletTransfers, walletativeTxns] = await Promise.all([
                walletTransfersReq,
                walletativeTxnsReq
            ]);
            const mappedTransfers = Array.from(walletTransfers.raw.result).map((transferItem)=>{
                const { transaction_hash, token_symbol, token_logo, token_decimals, value, from_address, to_address, block_timestamp } = transferItem;
                const transfer = {
                    hash: transaction_hash,
                    tokens: {
                        [token_symbol]: {
                            logo: token_logo ?? ""
                        }
                    },
                    from: from_address,
                    to: to_address,
                    direction: from_address === wallet.address.toLowerCase() ? "Out" : "In",
                    count: 1,
                    amount: +_ethers.ethers.utils.formatUnits(value, token_decimals),
                    date: block_timestamp
                };
                return transfer;
            });
            const mappedNativeTxns = Array.from(walletativeTxns.raw.result).filter((txn)=>+txn.value).map((txn)=>{
                const { hash, value, from_address, to_address, block_timestamp } = txn;
                const nativeTxn = {
                    hash,
                    tokens: {
                        [_models.Coins[wallet.chain].symbol]: {
                            logo: _models.Coins[wallet.chain].logo
                        }
                    },
                    from: from_address,
                    to: to_address,
                    direction: from_address === wallet.address.toLowerCase() ? "Out" : "In",
                    count: 1,
                    amount: +_ethers.ethers.utils.formatUnits(value, 18),
                    date: block_timestamp
                };
                return nativeTxn;
            });
            totalTxs = [
                ...totalTxs,
                ...mappedTransfers,
                ...mappedNativeTxns
            ];
        }));
        return {
            txs: totalTxs
        };
    }
    async getAssetsFromProvider(req) {
        try {
            const wallets = req.body["wallets"];
            const totalAssets = {};
            const totalAssetsByBlockchain = {};
            if (!Array.isArray(wallets)) throw new _models.CustomError(_types.ResponseMessage.WalletsMustBeArray, _models.ExceptionType.BadRequest);
            await Promise.all(wallets.map(async (wallet)=>{
                const covalentAssets = await (0, _covalent.covalentPortfolioRequest)(wallet);
                const filteredAssets = this.filterWalletAssets(covalentAssets.data.data);
                filteredAssets.forEach((item)=>{
                    const token = this.processToken(item, totalAssets);
                    this.updateBlockchainAssets(totalAssetsByBlockchain, wallet.chain, token);
                });
            }));
            const sortedAssets = Object.values(totalAssets).sort((a, b)=>b.quote - a.quote);
            const sortedAssetsByBlockchain = Object.values(totalAssetsByBlockchain).map((item)=>({
                    ...item,
                    assets: Object.values(item.assets).sort((a, b)=>b.quote - a.quote)
                }));
            return {
                assets: sortedAssets,
                assetsByBlockchain: sortedAssetsByBlockchain
            };
        } catch (error) {
            throw error;
        }
    }
    filterWalletAssets(walletData) {
        const desiredTokens = [
            _types.DesiredTokens.Safe.toString(),
            _types.DesiredTokens.Orange.toString()
        ];
        return walletData.items.filter((item)=>item.quote || desiredTokens.includes(item.contract_ticker_symbol));
    }
    processToken(item, totalAssets) {
        const uniqueKey = item.contract_address + item.contract_ticker_symbol;
        const token = {
            decimals: item.contract_decimals,
            symbol: item.contract_ticker_symbol,
            address: item.contract_address,
            logo: item.logo_url,
            quote: item.quote,
            quote_rate: item.quote_rate,
            balance: item.quote / item.quote_rate,
            uniqueKey
        };
        totalAssets[uniqueKey] = totalAssets[uniqueKey] || {
            ...token,
            quote: 0,
            balance: 0
        };
        totalAssets[uniqueKey].quote += token.quote;
        totalAssets[uniqueKey].balance += token.balance;
        return totalAssets[uniqueKey];
    }
    updateBlockchainAssets(totalAssetsByBlockchain, chain, token) {
        const blockchainAssets = totalAssetsByBlockchain[chain] || {
            blockchain: chain,
            totalAssetUsdValue: 0,
            topHolding: '',
            topHoldingUrl: '',
            top3HoldingsUrls: [],
            assets: {}
        };
        blockchainAssets.totalAssetUsdValue += token.quote;
        blockchainAssets.assets[token.uniqueKey] = token;
        const sortedAssets = Object.values(blockchainAssets.assets).sort((a, b)=>b.quote - a.quote);
        if (token.quote >= sortedAssets[0].quote) {
            blockchainAssets.topHolding = token.symbol;
            blockchainAssets.topHoldingUrl = token.logo;
        }
        blockchainAssets.top3HoldingsUrls = sortedAssets.slice(0, 3).map((asset)=>asset.logo);
        totalAssetsByBlockchain[chain] = blockchainAssets;
    }
}
TreasuryManager = _ts_decorate([
    (0, _inversify.injectable)()
], TreasuryManager);
const _default = TreasuryManager;
