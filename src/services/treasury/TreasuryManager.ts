import { Request, Response } from 'express'
import { injectable } from "inversify";
import ITreasuryService from "./ITreasuryService";
import { Db } from "mongodb";
import axios from 'axios';
import { AssetByBlockchainDto, AssetByBlockchainMap, AssetDto, AssetMap, AssetWallet, CovalentAsset, CovalentAssetHold } from '../../models';

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

        const apikey = `cqt_rQRqWWR7HXY7mjbyWdyhpRhQq7BK`
        const nativeTokenAddress = "0x0000000000000000000000000000000000000000";
        const ethCovalentAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
        const celoTokenAddress = "0x471ece3750da237f93b8e339c536989b8978a438"

        if (!Array.isArray(wallets)) return;

        await Promise.all(wallets.map(async (wallet: AssetWallet) => {
            const covalentAssets = await axios
                .get<{ data: CovalentAssetHold }>(`https://api.covalenthq.com/v1/${wallet.chain}/address/${wallet.address}/balances_v2/?key=${apikey}&`);

            covalentAssets.data.data.items.forEach((item: CovalentAsset) => {
                if (item.quote || item.contract_ticker_symbol === "SAFE" || item.contract_ticker_symbol === "✺ORANGE") {
                    const token_address = item.contract_address.includes(ethCovalentAddress) ? nativeTokenAddress : item.contract_address;
                    const token: AssetDto = {
                        decimals: item.contract_decimals,
                        symbol: item.contract_ticker_symbol,
                        address: token_address,
                        logo: item.logo_url,
                        quote: item.quote,
                        quote_rate: item.quote_rate,
                        balance: item.quote / item.quote_rate
                    };

                    totalAssets[token_address] = totalAssets[token_address] || { ...token, quote: 0, balance: 0 };
                    totalAssets[token_address].quote += token.quote;
                    totalAssets[token_address].balance += token.balance;

                    const blockchainAssets = totalAssetsByBlockchain[wallet.chain] || {
                        blockchain: wallet.chain,
                        totalAssetUsdValue: 0,
                        topHolding: '',
                        topHoldingUrl: '',
                        top3HoldingsUrls: [],
                        assets: {}
                    };

                    blockchainAssets.totalAssetUsdValue += token.quote;
                    blockchainAssets.assets[token_address] = totalAssets[token_address];

                    const sortedAssets = Object.values(blockchainAssets.assets).sort((a, b) => b.quote - a.quote);
                    if (token.quote > sortedAssets[0].quote) {
                        blockchainAssets.topHolding = token.symbol;
                        blockchainAssets.topHoldingUrl = token.logo;
                    }

                    blockchainAssets.top3HoldingsUrls = sortedAssets.slice(0, 3).map(asset => asset.logo);

                    totalAssetsByBlockchain[wallet.chain] = blockchainAssets;
                }
            });
        }))

        return {
            assets: Object.values(totalAssets),
            assetsByBlockchain: Object.values(totalAssetsByBlockchain)
                .map(item => { return { ...item, assets: Object.values(item.assets) } })
        };
    }
}

export default TreasuryManager;