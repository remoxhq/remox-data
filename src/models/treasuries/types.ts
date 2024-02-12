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
  
  export interface CovalentAsset {
    contract_decimals: number,
    contract_ticker_symbol: string,
    contract_address: string,
    logo_url: string,
    quote: number,
    quote_rate: number,
    balance: string
  }

  export interface AssetMap {
    [address: string]: AssetDto
  }

  export interface AssetByBlockchainMap {
    [blockchain: string]: AssetByBlockchainDto
  }

  export interface AssetByBlockchainDto {
    blockchain: string,
    totalAssetUsdValue: number,
    topHolding:string,
    topHoldingUrl: string,
    top3HoldingsUrls: string[],
    assets: AssetMap
  }

  export interface AssetDto {
    decimals: number,
    symbol: string,
    address: string,
    logo: string,
    quote: number,
    quote_rate: number,
    balance: number
  }
