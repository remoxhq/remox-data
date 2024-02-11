"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _inversify = require("inversify");
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const tresuryCollection = "OrganizationsHistoricalBalances";
class TreasuryManager {
    async getAnnualTreasury(req) {
        const orgName = req.params.name;
        if (!orgName) return;
        const db = req.app.locals.db;
        const collection = db.collection(tresuryCollection);
        const response = await collection.findOne({
            name: orgName
        });
        return response;
    }
    async getAssets(req, res) {
        const totalAssets = await this.getAssetsFromProvider(req);
        return res.status(200).send(totalAssets);
    }
    async getAssetsFromProvider(req) {
        const wallets = req.body["wallets"];
        const totalAssets = [];
        const apikey = `cqt_rQRqWWR7HXY7mjbyWdyhpRhQq7BK`;
        const nativeTokenAddress = "0x0000000000000000000000000000000000000000";
        const ethCovalentAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
        const celoTokenAddress = "0x471ece3750da237f93b8e339c536989b8978a438";
        if (!Array.isArray(wallets)) return;
        await Promise.all(wallets.map(async (wallet)=>{
            const covalentAssets = await _axios.default.get(`https://api.covalenthq.com/v1/${wallet.chain}/address/${wallet.address}/balances_v2/?key=${apikey}&`);
            totalAssets.push(Array.from(covalentAssets.data.data.items).reduce((acc, doc)=>{
                const token_address = doc.contract_address.includes(ethCovalentAddress) ? nativeTokenAddress : doc.contract_address;
                const token = {
                    contract_decimals: doc.contract_decimals,
                    contract_ticker_symbol: doc.contract_ticker_symbol,
                    contract_address: token_address,
                    logo_url: doc.logo_url,
                    quote: doc.quote,
                    quote_rate: doc.quote_rate,
                    balance: doc.balance
                };
                acc[token_address] = token;
                return acc;
            }, {}));
        }));
        return totalAssets;
    }
}
TreasuryManager = _ts_decorate([
    (0, _inversify.injectable)()
], TreasuryManager);
const _default = TreasuryManager;
