export interface FilteredResponse {
    year: {
        [name: string]: number;
    };
}

export interface TokenDataByDate {
    [key: string]: number;
}

interface TokenHolding {
    timestamp: string;
    quote_rate: number | null;
    close: {
        balance: string;
        quote: number | null;
        pretty_quote: string | null;
    };
}
interface Token {
    contract_ticker_symbol: string;
    contract_name: string;
    contract_address: string;
    logo_url: string;
    holdings: TokenHolding[];
}
interface Data {
    items: Token[];
}