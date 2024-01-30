const base = "/api/v1"

export const enum TreasuryRoute {
    GetAnnualTreasury = base + "/treasury/balance/:name"
}

export const enum OrganizationRoute {
    Create = base + "/organization/create",
    GetByName = base + "/organization/:name",
    GetAll = base + "/organization",
    Update = base + "/organization/:name",
    AddFavorites = base + "/organization/favorite/:organizationId",
}

export const enum AuthRoute {
    SingIn = base + "/auth/signin",
    UpdateRole = base + "/auth/role/update",
    UserFavOrgs = base + "/auth/favorites",
}