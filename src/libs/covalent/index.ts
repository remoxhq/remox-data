import axios from "axios";
import { AssetWallet, Coins, CovalentAssetHold } from "../../models";
import { config } from 'dotenv';
import Moralis from 'moralis';
config()

export * from "./covalent-networks"
export * from "./types"
export * from "@covalenthq/client-sdk";

export const covalentPortfolioRequest = async (wallet: AssetWallet) => {
    return await axios
        .get<{ data: CovalentAssetHold }>(`https://api.covalenthq.com/v1/${wallet.chain}/address/${wallet.address}/balances_v2/?key=${process.env.COVALENT_API_KEY}`);
}

export const covalentTxnRequest = async (wallet: AssetWallet) => {
    return await axios
        .get<{ data: any }>(wallet.page ?
            wallet.page + `?quote-currency=usd&key=${process.env.COVALENT_API_KEY}`
            : `https://api.covalenthq.com/v1/${wallet.chain}/address/${wallet.address}/transactions_v3/?quote-currency=usd&key=${process.env.COVALENT_API_KEY}`);
}

interface ExecutionType {
    [type: string]: () => any
}

export const moralisRequest = async (wallet: AssetWallet, type: string) => {
    if (!Moralis.Core.isStarted) {
        await Moralis.start({
            apiKey: process.env.MORALIS_API_KEY
        });
    }

    const query = {
        chain: Coins[wallet.chain].hexId,
        limit: 25,
        address: wallet.address,
        cursor: wallet.page
    }

    const execute = {
        ["Transfer"]: async () => await Moralis.EvmApi.token.getWalletTokenTransfers(query),
        ["Native"]: async () => await Moralis.EvmApi.transaction.getWalletTransactions(query)
    } as ExecutionType

    const response = await execute[type]()

    return response;
}
