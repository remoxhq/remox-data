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
    default: function() {
        return _default;
    },
    organizationCollection: function() {
        return organizationCollection;
    }
});
const _inversify = require("inversify");
const _models = require("../../models");
const _types = require("../../utils/types");
const _covalent = require("../../libs/covalent");
const _ethers = require("ethers");
const _responseHandler = require("../../utils/helpers/responseHandler");
const _logos = require("../../utils/logos");
const _jsonwebtoken = /*#__PURE__*/ _interop_require_default(require("jsonwebtoken"));
const _uuid = require("uuid");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const tresuryCollection = "OrganizationsHistoricalBalances";
const organizationCollection = "Organizations";
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
    //txns
    async getTransactionsFromProvider(req) {
        const slug = req.params.slug;
        const db = req.app.locals.db;
        const collection = db.collection(organizationCollection);
        const response = await collection.findOne({
            dashboardLink: slug,
            isDeleted: false
        });
        if (!response) throw new _models.CustomError(_types.ResponseMessage.OrganizationNotFound, _models.ExceptionType.NotFound);
        const nextData = req.params.next?.length > 10 ? _jsonwebtoken.default.verify(req.params.next, process.env.AUTH_SECRET_KEY) : {};
        let links = {};
        let totalTxs = [];
        await Promise.all(response.accounts.map(async (wallet)=>{
            const walletPageCursor = nextData[wallet.address] ? nextData[wallet.address].next : "";
            if (req.params.next.length === 2 || walletPageCursor) {
                if (wallet.chain === "celo-mainnet") {
                    const mappedCeloTxns = await this.processCeloTransactions(wallet, walletPageCursor);
                    totalTxs.push(...mappedCeloTxns?.txns ?? []);
                    if (mappedCeloTxns) links[wallet.address] = mappedCeloTxns.links[wallet.address];
                } else {
                    const mappedEvmTxns = await this.processEvmTxns(wallet, walletPageCursor);
                    totalTxs.push(...mappedEvmTxns.txns);
                    links[wallet.address] = mappedEvmTxns?.links[wallet.address];
                }
            }
        }));
        return {
            txs: totalTxs.sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime()),
            next: Object.keys(links).length && Object.values(links).some((x)=>x.next) ? _jsonwebtoken.default.sign(links, process.env.AUTH_SECRET_KEY) : undefined
        };
    }
    async processCeloTransactions(wallet, page) {
        const response = await (0, _covalent.covalentTxnRequest)(wallet, page);
        const items = response.data.data.items;
        if (!items) return null;
        const links = {
            next: response.data.data.links.prev ?? "",
            prev: response.data.data.links.next ?? ""
        };
        const mappedTxns = [];
        for (const transaction of items){
            if (transaction.log_events) this.processCeloTransfers(transaction, mappedTxns, wallet);
            else this.processCeloNativeTxns(transaction, mappedTxns, wallet);
        }
        return {
            txns: mappedTxns,
            links: {
                [wallet.address]: links
            }
        };
    }
    async processCeloTransfers(transaction, mappedTxns, wallet) {
        for (const logEvent of transaction.log_events){
            if (!logEvent.decoded || logEvent.decoded.name !== "Transfer") continue;
            if (logEvent.decoded.name === "TransferSingle") break;
            const { sender_contract_ticker_symbol, sender_contract_decimals, block_signed_at } = logEvent;
            const from = logEvent.decoded.params[0].value;
            const to = logEvent.decoded.params[1].value;
            const amount = logEvent.decoded.params[2].value;
            const symbol = sender_contract_ticker_symbol?.toString().toLowerCase();
            if (from !== wallet.address.toLowerCase() && to !== wallet.address.toLowerCase()) continue;
            mappedTxns.push({
                id: (0, _uuid.v4)() + transaction.tx_hash.substring(0, 5) + +_ethers.ethers.utils.formatUnits(amount, sender_contract_decimals),
                hash: transaction.tx_hash,
                from: from,
                to: to,
                assetLogo: _logos.logos[symbol ? symbol : ""] ? _logos.logos[symbol]?.logoUrl : "",
                assetName: sender_contract_ticker_symbol,
                amount: +_ethers.ethers.utils.formatUnits(amount, sender_contract_decimals),
                direction: from === wallet.address.toLowerCase() ? "Out" : "In",
                date: block_signed_at,
                chain: wallet.chain
            });
        }
    }
    async processCeloNativeTxns(transaction, mappedTxns, wallet) {
        if (!transaction.value) return;
        const { sender_contract_decimals, block_signed_at, from_address, to_address } = transaction;
        mappedTxns.push({
            id: (0, _uuid.v4)() + transaction.tx_hash.substring(0, 5) + +_ethers.ethers.utils.formatUnits(transaction.value, sender_contract_decimals),
            hash: transaction.tx_hash,
            from: from_address,
            to: to_address,
            assetLogo: _models.Coins[wallet.chain].logo,
            assetName: _models.Coins[wallet.chain].symbol,
            amount: +_ethers.ethers.utils.formatUnits(transaction.value, sender_contract_decimals),
            direction: from_address === wallet.address.toLowerCase() ? "Out" : "In",
            date: block_signed_at,
            chain: wallet.chain
        });
    }
    async processEvmTxns(wallet, page) {
        const walletTransfersReq = (0, _covalent.moralisRequest)(wallet, page, "Transfer");
        const walletativeTxnsReq = (0, _covalent.moralisRequest)(wallet, page, "Native");
        const [walletTransfers, walletativeTxns] = await Promise.all([
            walletTransfersReq,
            walletativeTxnsReq
        ]);
        const links = {
            next: walletTransfers.jsonResponse.cursor ?? "",
            prev: ""
        };
        const mappedTransfers = this.processTransfers(walletTransfers, wallet);
        const mappedNativeTxns = this.processNativeTxns(walletativeTxns, wallet);
        return {
            txns: [
                ...mappedTransfers,
                ...mappedNativeTxns
            ],
            links: {
                [wallet.address]: links
            }
        };
    }
    processTransfers(walletTransfers, wallet) {
        const mappedTransfers = Array.from(walletTransfers.raw.result).map((transferItem)=>{
            const transfer = {
                id: (0, _uuid.v4)() + transferItem.transaction_hash?.substring(0, 5) + +_ethers.ethers.utils.formatUnits(transferItem.value, transferItem.token_decimals),
                hash: transferItem.transaction_hash,
                assetName: transferItem.token_symbol,
                assetLogo: _logos.logos[transferItem.token_symbol?.toLowerCase()] ? _logos.logos[transferItem.token_symbol.toLowerCase()].logoUrl : "",
                from: transferItem.from_address,
                to: transferItem.to_address,
                direction: transferItem.from_address === wallet.address.toLowerCase() ? "Out" : "In",
                count: 1,
                amount: +_ethers.ethers.utils.formatUnits(transferItem.value, transferItem.token_decimals),
                date: transferItem.block_timestamp,
                chain: wallet.chain
            };
            return transfer;
        });
        return mappedTransfers;
    }
    processNativeTxns(walletNativeTxns, wallet) {
        const mappedTransfers = Array.from(walletNativeTxns.raw.result).filter((x)=>x.amount).map((txn)=>{
            const transfer = {
                id: (0, _uuid.v4)() + txn.hash?.substring(0, 5) + txn.value ? +_ethers.ethers.utils.formatUnits(txn.value, 18) : 0,
                hash: txn.hash,
                assetName: _models.Coins[wallet.chain].symbol,
                assetLogo: _models.Coins[wallet.chain].logo ?? "",
                from: txn.from_address,
                to: txn.to_address,
                direction: txn.from_address === wallet.address.toLowerCase() ? "Out" : "In",
                count: 1,
                amount: txn.value ? +_ethers.ethers.utils.formatUnits(txn.value, 18) : 0,
                date: txn.block_timestamp,
                chain: wallet.chain
            };
            return transfer;
        });
        return mappedTransfers;
    }
    // Assets
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
                    const token = this.processToken(item, totalAssets, wallet);
                    this.updateBlockchainAssets(totalAssetsByBlockchain, wallet.chain, token);
                });
            }));
            const sortedAssets = Object.values(totalAssets).sort((a, b)=>b.quote - a.quote);
            const sortedAssetsByBlockchain = Object.values(totalAssetsByBlockchain).map((item)=>({
                    ...item,
                    totalAssetUsdValue: Object.values(item.assets).reduce((result, x)=>result += x.quote, 0),
                    assets: Object.values(item.assets).sort((a, b)=>b.quote - a.quote)
                })).sort((a, b)=>b.totalAssetUsdValue - a.totalAssetUsdValue);
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
        return walletData.items.filter((item)=>item.contract_name !== 'Celo native asset' && (item.quote || desiredTokens.includes(item.contract_ticker_symbol)));
    }
    processToken(item, totalAssets, wallet) {
        const uniqueKey = item.contract_address + item.contract_ticker_symbol;
        const token = {
            decimals: item.contract_decimals,
            symbol: item.contract_ticker_symbol,
            address: item.contract_address,
            logo: _logos.logos[item.contract_ticker_symbol?.toLowerCase() ?? ""]?.logoUrl ?? "",
            quote: item.quote,
            quote_rate: item.quote_rate,
            balance: item.quote / item.quote_rate,
            uniqueKey,
            chain: wallet.chain
        };
        totalAssets[uniqueKey] = totalAssets[uniqueKey] || {
            ...token,
            quote: 0,
            balance: 0
        };
        totalAssets[uniqueKey].quote += +token.quote;
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
