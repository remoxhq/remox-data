//portfolio DTOs
export interface TreasuryIndexer {
    [date: string]: DailyTreasury
}

export interface DailyTreasury {
    totalTreasury: number,
    tokenBalances: DailyTreasuryTokenIndexer
    networkBalances: DailyTreasuryTokenIndexer
}

export interface DailyTreasuryTokenIndexer {
    [symbol: string]: number
}

//asset DTOs

export interface AssetWallet {
    address:string,
    chain:string
}

export interface CovalentAssetHold {
    address: string,
    items: CovalentAsset[]
  }
  
  export interface CoinsCovalent {
    [address: string]: CovalentAsset
  }
  
  export interface CovalentAsset {
    contract_decimals: number,
    contract_ticker_symbol: string,
    contract_address: string,
    logo_url: string,
    quote: number,
    quote_rate: number,
    balance: string
  }
