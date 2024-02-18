import axios from "axios";
import { AssetWallet, CovalentAssetHold } from "../../models";
import { config } from 'dotenv';
config()

export * from "./covalent-networks"
export * from "./types"
export * from "@covalenthq/client-sdk";

export const covalentPortfolioRequest = async (wallet : AssetWallet) =>{
    return await axios
                .get<{ data: CovalentAssetHold }>(`https://api.covalenthq.com/v1/${wallet.chain}/address/${wallet.address}/balances_v2/?key=${process.env.COVALENT_API_KEY}&`);
}