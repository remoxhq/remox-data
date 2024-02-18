import { Request, Response } from 'express'
import { injectable } from "inversify";
import ITreasuryService from "./ITreasuryService";
import { Db } from "mongodb";
import { AssetByBlockchainMap, AssetDto, AssetMap, AssetWallet, CovalentAsset, CovalentAssetHold } from '../../models';
import { DesiredTokens } from '../../utils/types';
import { covalentPortfolioRequest } from '../../libs/covalent';

const tresuryCollection = "OrganizationsHistoricalBalances";

@injectable()
class TreasuryManager implements ITreasuryService {

    async getAnnualTreasury(req: Request) {
        const orgName = req.params.name;
        if (!orgName) return;

        const db = req.app.locals.db as Db;
        const collection = db.collection(tresuryCollection);
        const response = await collection.findOne({ name: orgName });
        return response;
    }

    async getAssets(req: Request, res: Response) {
        const totalAssets = await this.getAssetsFromProvider(req)
        return res.status(200).send(totalAssets);
    }

    private async getAssetsFromProvider(req: Request) {
        const wallets = req.body["wallets"] as AssetWallet[];

        const totalAssets: AssetMap = {}
        const totalAssetsByBlockchain: AssetByBlockchainMap = {}

        if (!Array.isArray(wallets)) return;

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