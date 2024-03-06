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
    AuthRoute: function() {
        return AuthRoute;
    },
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
    TreasuryRoute[TreasuryRoute["GetAssets"] = base + "/treasury/assets"] = "GetAssets";
    TreasuryRoute[TreasuryRoute["GetTransactions"] = base + "/treasury/txs/:slug/:next?"] = "GetTransactions";
})(TreasuryRoute || (TreasuryRoute = {}));
var OrganizationRoute;
(function(OrganizationRoute) {
    OrganizationRoute[OrganizationRoute["Create"] = base + "/organization/create"] = "Create";
    OrganizationRoute[OrganizationRoute["GetByName"] = base + "/organization/:slug"] = "GetByName";
    OrganizationRoute[OrganizationRoute["GetAll"] = base + "/organization"] = "GetAll";
    OrganizationRoute[OrganizationRoute["Update"] = base + "/organization/update/:id"] = "Update";
    OrganizationRoute[OrganizationRoute["Delete"] = base + "/organization/:id"] = "Delete";
    OrganizationRoute[OrganizationRoute["AddFavorites"] = base + "/organization/favorite/:organizationId"] = "AddFavorites";
    OrganizationRoute[OrganizationRoute["GetAllForUpdate"] = base + "/organizations/all"] = "GetAllForUpdate";
})(OrganizationRoute || (OrganizationRoute = {}));
var AuthRoute;
(function(AuthRoute) {
    AuthRoute[AuthRoute["SingIn"] = base + "/auth/signin"] = "SingIn";
    AuthRoute[AuthRoute["UpdateRole"] = base + "/auth/role/update"] = "UpdateRole";
    AuthRoute[AuthRoute["UserFavOrgs"] = base + "/auth/favorites"] = "UserFavOrgs";
})(AuthRoute || (AuthRoute = {}));
