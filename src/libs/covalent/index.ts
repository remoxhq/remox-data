import axios from "axios";
import { AssetWallet, CovalentAssetHold } from "../../models";
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

export const moralisTransactionsRequest = async (wallet: AssetWallet) => {
    await Moralis.start({
        apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjRjMzU4NGVhLTVlNjUtNDkzMS05NTE3LWFmMzE2NTYyNTcyNyIsIm9yZ0lkIjoiMzc4Mjc3IiwidXNlcklkIjoiMzg4NzI3IiwidHlwZUlkIjoiYTIzNzk4MWUtODMzNi00ZGIwLWFhNjYtNDZmMTc3OWNlYjViIiwidHlwZSI6IlBST0pFQ1QiLCJpYXQiOjE3MDg0Mzg5MzUsImV4cCI6NDg2NDE5ODkzNX0.RNjCuBGn7fDO5KYkMOBRPNLYlgCpJktEzk05e5dDFb8'
    });

    const response = await Moralis.EvmApi.transaction.getWalletTransactionsVerbose({
        "chain": wallet.chain,
        "limit": 20,
        "address": wallet.address
    });

    return response;
}