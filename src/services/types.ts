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
