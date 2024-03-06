//portfolio DTOs

export interface Portfolio {
  annual: TreasuryIndexer,
  existingTokenLogos: { [symbol: string]: string }
}

export interface TreasuryIndexer {
  [date: string]: DailyTreasury,
}

export interface DailyTreasury {
  totalTreasury: number,
  tokenBalances: DailyTokenIndexer
  networkBalances: DailyTreasuryTokenIndexer
}

export interface DailyTreasuryTokenIndexer {
  [symbol: string]: number
}

export interface DailyTokenIndexer {
  [symbol: string]: {
    balanceUsd: number,
    tokenCount: number,
    tokenUsdValue: number
  }
}

//asset DTOs

export interface AssetWallet {
  address: string,
  chain: string,
  page: string
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

export interface PagingLinks {
  prev: string,
  next: string
}

export interface NativeTokenLogos {
  [chain: string]: {
    symbol: string,
    logo: string,
    hexId: string
  }
}

export const Coins: NativeTokenLogos = {
  ["eth-mainnet"]: {
    symbol: "ETH",
    logo: "https://community.remox.io/icons/currencies/ethereum_evm.svg",
    hexId: "0x1"
  },
  ["arbitrum-mainnet"]: {
    symbol: "ETH",
    logo: "https://community.remox.io/icons/currencies/ethereum_evm.svg",
    hexId: "0xa4b1"
  },
  ["matic-mainnet"]: {
    symbol: "ETH",
    logo: "https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png?1624446912",
    hexId: "0x89"
  },
  ["avalanche-mainnet"]: {
    symbol: "AVAX",
    logo: "https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png",
    hexId: "0xa86a"
  },
  ["optimism-mainnet"]: {
    symbol: "ETH",
    logo: "https://community.remox.io/icons/currencies/ethereum_evm.svg",
    hexId: "0xa"
  },
  ["gnosis-mainnet"]: {
    symbol: "ETH",
    logo: "https://community.remox.io/icons/currencies/ethereum_evm.svg",
    hexId: "0x64"
  },
  ["bsc-mainnet"]: {
    symbol: "BNB",
    logo: "https://community.remox.io/icons/currencies/ethereum_evm.svg",
    hexId: "0x38"
  },
  ["celo-mainnet"]: {
    symbol: "Celo",
    logo: "https://celoscan.io/images/svg/brands/main.svg?v=24.2.3.0",
    hexId: ""
  },
}
