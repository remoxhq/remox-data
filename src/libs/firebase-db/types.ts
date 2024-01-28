export interface OrganizationIndexer {
    [name: string]: Organization
}

export interface Organization {
    wallets: {
        address: string,
        network: string
    }[],
}