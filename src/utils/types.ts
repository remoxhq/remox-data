export const TYPES = {
    IOrganizationService: Symbol.for("IOrganizationService"),
    ITreasuryService: Symbol.for("ITreasuryService"),
    IStorageService: Symbol.for("IStorageService"),
    TreasuryController: Symbol.for("TreasuryController"),
    OrganizationController: Symbol.for("OrganizationController")
};

export const enum ResponseMessage {
    OrganizationCreated = "Organization is created successfully",
    OrganizationNotFound = "Organization is not found",
    OrganizationUpdated = "Organization is updated successfully",
};