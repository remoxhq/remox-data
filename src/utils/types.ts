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
    OrganizationCreated = "Organization is created successfully and will be activated in a few seconds.",
    OrganizationNotFound = "Organization is not found",
    OrganizationAlreadyExist = "Dashboard link is already in use.",
    OrganizationIdRequired = "Organization id is required",
    OrganizationUpdated = "Organization is updated successfully and will be activated in a few seconds.",
    UnAuthorizedAction = "Signature is invalid",
    UnknownServerError = "Internal server error",
    UserNotFound = "User is not found",
    UserUpdated = "User is updated",
    UserPublicKeyRequired = "User public key is required",
    ForbiddenRequest = "Forbidden attempt.",
    WalletsMustBeArray = "Wallets must be an array",
};

export const enum Roles {
    SuperAdmin = "Super Admin",
    Admin = "Admin",
    User = "User",
};

export const enum DesiredTokens {
    Safe = "SAFE",
    Orange = "✺ORANGE",
};