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
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const tresuryCollection = "OrganizationsHistoricalBalances";
let TreasuryManager = class TreasuryManager {
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
};
TreasuryManager = _ts_decorate([
    (0, _inversify.injectable)()
], TreasuryManager);
const _default = TreasuryManager;
