import { Request, Response } from 'express'
import { injectable } from "inversify";
import ITreasuryService from "./ITreasuryService";
import { Db } from "mongodb";
import { AppResponse, AssetByBlockchainMap, AssetDto, AssetMap, AssetWallet, Coins, CovalentAsset, CovalentAssetHold, CustomError, ExceptionType } from '../../models';
import { DesiredTokens, ResponseMessage } from '../../utils/types';
import { covalentPortfolioRequest, covalentTxnRequest, moralisRequest } from '../../libs/covalent';
import { ethers } from 'ethers';
import { handleError } from '../../utils/helpers/responseHandler';

const tresuryCollection = "OrganizationsHistoricalBalances";

@injectable()
class TreasuryManager implements ITreasuryService {

    async getAnnualTreasury(req: Request, res: Response) {
        try {
            const orgName = req.params.name;

            const db = req.app.locals.db as Db;
            const collection = db.collection(tresuryCollection);
            const response = await collection.findOne({ name: orgName });

            if (!response)
                throw new CustomError(ResponseMessage.OrganizationNotFound, ExceptionType.NotFound);

            return res.status(200).send(new AppResponse(200, true, undefined, response));
        } catch (error: any) {
            return handleError(res, error)
        }
    }

    async getAssets(req: Request, res: Response) {
        try {
            const totalAssets = await this.getAssetsFromProvider(req)
            return res.status(200).send(new AppResponse(200, true, undefined, totalAssets));
        } catch (error) {
            return handleError(res, error)
        }
    }

    async getTransactions(req: Request, res: Response) {
        try {
            const txs = await this.getTransactionsFromProvider(req)
            return res.status(200).send(new AppResponse(200, true, undefined, txs));
        } catch (error) {
            return handleError(res, error)
        }
    }

    private async getTransactionsFromProvider(req: Request) {
        const wallets = req.body["wallets"] as AssetWallet[];

        if (!Array.isArray(wallets))
            throw new CustomError(ResponseMessage.WalletsMustBeArray, ExceptionType.BadRequest);

        let totalTxs: any[] = []

        await Promise.all(wallets.map(async (wallet: AssetWallet) => {
            if (wallet.chain === "celo-mainnet") totalTxs.push(...await this.processCeloTransactions(wallet))
            else totalTxs.push(...await this.processEvmTxns(wallet))
        }));

        return {
            txs: totalTxs.length,
        };
    }

    //txns
    private async processCeloTransactions(wallet: AssetWallet) {
        const response = await covalentTxnRequest(wallet);
        const items = response.data.data.items;
        if (!items) return [];

        const mappedTxns: any[] = []

        for (const transaction of items) {
            if (transaction.log_events) this.processCeloTransfers(transaction, mappedTxns, wallet);
            else this.processCeloNativeTxns(transaction, mappedTxns, wallet)
        }

        return [...mappedTxns!]
    }

    private async processCeloTransfers(transaction: any, mappedTxns: any[], wallet: AssetWallet) {
        for (const logEvent of transaction.log_events) {
            if (!logEvent.decoded || logEvent.decoded.name !== "Transfer") continue;
            if (logEvent.decoded.name === "TransferSingle") break;

            const { sender_contract_ticker_symbol, sender_logo_url, sender_contract_decimals, block_signed_at } = logEvent;
            const from = logEvent.decoded.params[0].value;
            const to = logEvent.decoded.params[1].value;
            const amount = logEvent.decoded.params[2].value;

            mappedTxns.push(
                {
                    hash: transaction.tx_hash,
                    from: from,
                    to: to,
                    assetLogo: sender_logo_url,
                    assetName: sender_contract_ticker_symbol,
                    amount: +ethers.utils.formatUnits(amount, sender_contract_decimals),
                    direction: from === wallet.address.toLowerCase() ? "Out" : "In",
                    date: block_signed_at,
                }
            )
        }
    }

    private async processCeloNativeTxns(transaction: any, mappedTxns: any[], wallet: AssetWallet) {
        if (!transaction.value) return;
        const { sender_contract_decimals, block_signed_at, from_address, to_address } = transaction;

        mappedTxns.push(
            {
                hash: transaction.tx_hash,
                from: from_address,
                to: to_address,
                assetLogo: Coins[wallet.chain].logo,
                assetName: Coins[wallet.chain].symbol,
                amount: +ethers.utils.formatUnits(transaction.value, sender_contract_decimals),
                direction: from_address === wallet.address.toLowerCase() ? "Out" : "In",
                date: block_signed_at,
            }
        )
    }

    private async processEvmTxns(wallet: AssetWallet) {
        const walletTransfersReq = moralisRequest(wallet, "Transfer");
        const walletativeTxnsReq = moralisRequest(wallet, "Native");

        const [walletTransfers, walletativeTxns] = await Promise.all([walletTransfersReq, walletativeTxnsReq])

        const mappedTransfers = this.processTransfers(walletTransfers, wallet)
        const mappedNativeTxns = this.processNativeTxns(walletativeTxns, wallet)

        return [...mappedTransfers, ...mappedNativeTxns];
    }

    private processTransfers(walletTransfers: any, wallet: AssetWallet) {
        const mappedTransfers = Array.from(walletTransfers.raw.result)
            .map((transferItem: any) => {
                const transfer = {
                    hash: transferItem.transaction_hash,
                    assetName: transferItem.token_symbol,
                    assetLogo: transferItem.token_logo ?? "",
                    from: transferItem.from_address,
                    to: transferItem.to_address,
                    direction: transferItem.from_address === wallet.address.toLowerCase() ? "Out" : "In",
                    count: 1,
                    amount: +ethers.utils.formatUnits(transferItem.value, transferItem.token_decimals),
                    date: transferItem.block_timestamp,
                };

                return transfer;
            })

        return mappedTransfers;
    }

    private processNativeTxns(walletNativeTxns: any, wallet: AssetWallet) {
        const mappedTransfers = Array.from(walletNativeTxns.raw.result)
            .map((txn: any) => {
                const transfer = {
                    hash: txn.hash,
                    assetName: Coins[wallet.chain].symbol,
                    assetLogo: Coins[wallet.chain].logo ?? "",
                    from: txn.from_address,
                    to: txn.to_address,
                    direction: txn.from_address === wallet.address.toLowerCase() ? "Out" : "In",
                    count: 1,
                    amount: txn.value ? +ethers.utils.formatUnits(txn.value, 18) : 0,
                    date: txn.block_timestamp,
                };

                return transfer;
            })

        return mappedTransfers;
    }

    // Assets
    private async getAssetsFromProvider(req: Request) {
        try {
            const wallets = req.body["wallets"] as AssetWallet[];

            const totalAssets: AssetMap = {}
            const totalAssetsByBlockchain: AssetByBlockchainMap = {}

            if (!Array.isArray(wallets))
                throw new CustomError(ResponseMessage.WalletsMustBeArray, ExceptionType.BadRequest);

            await Promise.all(wallets.map(async (wallet: AssetWallet) => {
                const covalentAssets = await covalentPortfolioRequest(wallet);

                const filteredAssets = this.filterWalletAssets(covalentAssets.data.data);

                filteredAssets.forEach((item: CovalentAsset) => {
                    const token = this.processToken(item, totalAssets);
                    this.updateBlockchainAssets(totalAssetsByBlockchain, wallet.chain, token)
                });
            }))

            const sortedAssets = Object.values(totalAssets).sort((a, b) => b.quote - a.quote);
            const sortedAssetsByBlockchain = Object.values(totalAssetsByBlockchain).map((item) => ({
                ...item,
                assets: Object.values(item.assets).sort((a, b) => b.quote - a.quote),
            }));

            return {
                assets: sortedAssets,
                assetsByBlockchain: sortedAssetsByBlockchain
            };

        } catch (error) {
            throw error
        }
    }

    private filterWalletAssets(walletData: CovalentAssetHold) {
        const desiredTokens = [DesiredTokens.Safe.toString(), DesiredTokens.Orange.toString()];
        return walletData.items.filter(item => item.quote || (desiredTokens.includes(item.contract_ticker_symbol)));
    }

    private processToken(item: CovalentAsset, totalAssets: AssetMap) {
        const uniqueKey = item.contract_address + item.contract_ticker_symbol;

        const token: AssetDto = {
            decimals: item.contract_decimals,
            symbol: item.contract_ticker_symbol,
            address: item.contract_address,
            logo: item.logo_url,
            quote: item.quote,
            quote_rate: item.quote_rate,
            balance: item.quote / item.quote_rate,
            uniqueKey
        };

        totalAssets[uniqueKey] = totalAssets[uniqueKey] || { ...token, quote: 0, balance: 0 };
        totalAssets[uniqueKey].quote += token.quote;
        totalAssets[uniqueKey].balance += token.balance;

        return totalAssets[uniqueKey];
    }

    private updateBlockchainAssets(totalAssetsByBlockchain: AssetByBlockchainMap, chain: string, token: AssetDto) {
        const blockchainAssets = totalAssetsByBlockchain[chain] || {
            blockchain: chain,
            totalAssetUsdValue: 0,
            topHolding: '',
            topHoldingUrl: '',
            top3HoldingsUrls: [],
            assets: {},
        };

        blockchainAssets.totalAssetUsdValue += token.quote;
        blockchainAssets.assets[token.uniqueKey] = token;

        const sortedAssets = Object.values(blockchainAssets.assets).sort((a, b) => b.quote - a.quote);

        if (token.quote >= sortedAssets[0].quote) {
            blockchainAssets.topHolding = token.symbol;
            blockchainAssets.topHoldingUrl = token.logo;
        }

        blockchainAssets.top3HoldingsUrls = sortedAssets.slice(0, 3).map(asset => asset.logo);

        totalAssetsByBlockchain[chain] = blockchainAssets;
    }
}

export default TreasuryManager;