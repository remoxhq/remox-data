const base = "/api/v1"

export const enum TreasuryRoute {
    GetAnnualTreasury = base + "/treasury/balance/:name",
    GetAssets = base + "/treasury/assets"
}

export const enum OrganizationRoute {
    Create = base + "/organization/create",
    GetByName = base + "/organization/:id",
    GetAll = base + "/organization",
    Update = base + "/organization/update/:id",
    Delete = base + "/organization/:id",
    AddFavorites = base + "/organization/favorite/:organizationId",
}

export const enum AuthRoute {
    SingIn = base + "/auth/signin",
    UpdateRole = base + "/auth/role/update",
    UserFavOrgs = base + "/auth/favorites",
}