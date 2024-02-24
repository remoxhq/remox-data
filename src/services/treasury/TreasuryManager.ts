import { Request, Response } from 'express'
import { injectable } from "inversify";
import ITreasuryService from "./ITreasuryService";
import { Db } from "mongodb";
import { AppResponse, AssetByBlockchainMap, AssetDto, AssetMap, AssetWallet, Coins, CovalentAsset, CovalentAssetHold, CustomError, ExceptionType, TransferDto } from '../../models';
import { DesiredTokens, ResponseMessage } from '../../utils/types';
import { covalentPortfolioRequest, moralisRequest } from '../../libs/covalent';
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
            const walletTransfersReq = moralisRequest(wallet, "Transfer");
            const walletativeTxnsReq = moralisRequest(wallet, "Native");
            const [walletTransfers, walletativeTxns] = await Promise.all([walletTransfersReq, walletativeTxnsReq])

            const mappedTransfers = Array.from(walletTransfers.raw.result)
                .map((transferItem: any) => {
                    const { transaction_hash,
                        token_symbol,
                        token_logo,
                        token_decimals,
                        value,
                        from_address,
                        to_address,
                        block_timestamp } = transferItem;

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
                        amount: +ethers.utils.formatUnits(value, token_decimals),
                        date: block_timestamp
                    };

                    return transfer;
                })

            const mappedNativeTxns = Array.from(walletativeTxns.raw.result)
                .filter((txn: any) => +txn.value)
                .map((txn: any) => {
                    const { hash, value, from_address, to_address, block_timestamp } = txn;

                    const nativeTxn = {
                        hash,
                        tokens: {
                            [Coins[wallet.chain].symbol]: {
                                logo: Coins[wallet.chain].logo
                            }
                        },
                        from: from_address,
                        to: to_address,
                        direction: from_address === wallet.address.toLowerCase() ? "Out" : "In",
                        count: 1,
                        amount: +ethers.utils.formatUnits(value, 18),
                        date: block_timestamp
                    };

                    return nativeTxn;
                })

            totalTxs = [...totalTxs, ...mappedTransfers, ...mappedNativeTxns]
        }));

        return {
            txs: totalTxs,
        };
    }

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