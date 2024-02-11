import { Request, Response } from 'express'
import { injectable } from "inversify";
import ITreasuryService from "./ITreasuryService";
import { Db } from "mongodb";
import axios from 'axios';
import { AssetWallet, CoinsCovalent, CovalentAsset, CovalentAssetHold } from '../../models';

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

    async getAssets(req: Request, res: Response){
        const totalAssets = await this.getAssetsFromProvider(req)

        return res.status(200).send(totalAssets);
    }

    private async getAssetsFromProvider(req: Request){
        const wallets = req.body["wallets"] as AssetWallet[];

        const totalAssets: CoinsCovalent[] = []

        const apikey = `cqt_rQRqWWR7HXY7mjbyWdyhpRhQq7BK`
        const nativeTokenAddress = "0x0000000000000000000000000000000000000000";
        const ethCovalentAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
        const celoTokenAddress = "0x471ece3750da237f93b8e339c536989b8978a438"

        if(!Array.isArray(wallets)) return;

        await Promise.all(wallets.map(async (wallet:any)=>{
            const covalentAssets = await axios.get<{data: CovalentAssetHold}>(`https://api.covalenthq.com/v1/${wallet.chain}/address/${wallet.address}/balances_v2/?key=${apikey}&`);

        totalAssets.push(
            Array.from(covalentAssets.data.data.items).reduce<CoinsCovalent>((acc, doc) => {
                const token_address = doc.contract_address.includes(ethCovalentAddress) ? nativeTokenAddress : doc.contract_address;
                const token: CovalentAsset = {
                    contract_decimals: doc.contract_decimals,
                    contract_ticker_symbol: doc.contract_ticker_symbol,
                    contract_address: token_address,
                    logo_url: doc.logo_url,
                    quote: doc.quote,
                    quote_rate: doc.quote_rate,
                    balance: doc.balance
                }
                acc[token_address] = token;
    
                return acc;
            }, {})
        )
       }))

       return totalAssets;
    }
}

export default TreasuryManager;