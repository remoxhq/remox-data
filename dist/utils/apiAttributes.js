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
var TreasuryRoute;
(function(TreasuryRoute) {
    TreasuryRoute["GetAnnualTreasury"] = "/treasury/balance/:name";
})(TreasuryRoute || (TreasuryRoute = {}));
var OrganizationRoute;
(function(OrganizationRoute) {
    OrganizationRoute["Create"] = "/organization/create";
})(OrganizationRoute || (OrganizationRoute = {}));
