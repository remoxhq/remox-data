"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    OrganizationRoute: function() {
        return OrganizationRoute;
    },
    TreasuryRoute: function() {
        return TreasuryRoute;
    }
});
const base = "/api/v1";
var TreasuryRoute;
(function(TreasuryRoute) {
    TreasuryRoute[TreasuryRoute["GetAnnualTreasury"] = base + "/treasury/balance/:name"] = "GetAnnualTreasury";
})(TreasuryRoute || (TreasuryRoute = {}));
var OrganizationRoute;
(function(OrganizationRoute) {
    OrganizationRoute[OrganizationRoute["Create"] = base + "/organization/create"] = "Create";
    OrganizationRoute[OrganizationRoute["GetByName"] = base + "/organization/:name"] = "GetByName";
    OrganizationRoute[OrganizationRoute["GetAll"] = base + "/organization"] = "GetAll";
    OrganizationRoute[OrganizationRoute["Update"] = base + "/organization/:name"] = "Update";
})(OrganizationRoute || (OrganizationRoute = {}));
