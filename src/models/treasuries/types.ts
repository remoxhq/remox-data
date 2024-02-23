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
  address: string,
  chain: string
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
  topHolding: string,
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
  uniqueKey: string
}

// txn DTOs

export interface TransferDto {
  [hash: string]: {
    hash: string;
    tokens: {
      [symbol: string]: {
        logo: string
      }
    };
    from: string;
    to: string;
    count: number;
    direction: string,
    amount: number,
    date: string
  }
}

export interface NativeTokenLogos {
  [chain: string]: {
    symbol: string,
    logo: string
  }
}

export const Coins: NativeTokenLogos = {
  ["0x1"]: {
    symbol: "ETH",
    logo: "https://community.remox.io/icons/currencies/ethereum_evm.svg"
  },
  ["0xa4b1"]: {
    symbol: "ETH",
    logo: "https://community.remox.io/icons/currencies/ethereum_evm.svg"
  },
  ["0x89"]: {
    symbol: "ETH",
    logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912"
  },
  ["0xa86a"]: {
    symbol: "AVAX",
    logo: "https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png"
  },
  ["0xa"]: {
    symbol: "ETH",
    logo: "https://community.remox.io/icons/currencies/ethereum_evm.svg"
  },
  ["0x64"]: {
    symbol: "ETH",
    logo: "https://community.remox.io/icons/currencies/ethereum_evm.svg"
  },
  ["0x38"]: {
    symbol: "BNB",
    logo: "https://community.remox.io/icons/currencies/ethereum_evm.svg"
  },
}
