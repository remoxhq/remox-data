export const TYPES = {
    IOrganizationService: Symbol.for("IOrganizationService"),
    ITreasuryService: Symbol.for("ITreasuryService"),
    IStorageService: Symbol.for("IStorageService"),
    IAuthService: Symbol.for("IAuthService"),
    TreasuryController: Symbol.for("TreasuryController"),
    OrganizationController: Symbol.for("OrganizationController"),
    AuthController: Symbol.for("AuthController")
};

export const enum ResponseMessage {
    OrganizationCreated = "Organization is created successfully",
    OrganizationNotFound = "Organization is not found",
    OrganizationUpdated = "Organization is updated successfully",
    UnAuthorizedAction = "Signature is invalid",
    UnknownServerError = "Internal server error",
};

export const enum Roles {
    SuperAdmin = "Super Admin",
    Admin = "Admin",
    User = "User",
};