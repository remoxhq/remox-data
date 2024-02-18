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
    DesiredTokens: function() {
        return DesiredTokens;
    },
    ResponseMessage: function() {
        return ResponseMessage;
    },
    Roles: function() {
        return Roles;
    },
    TYPES: function() {
        return TYPES;
    }
});
const TYPES = {
    IOrganizationService: Symbol.for("IOrganizationService"),
    ITreasuryService: Symbol.for("ITreasuryService"),
    IStorageService: Symbol.for("IStorageService"),
    IAuthService: Symbol.for("IAuthService"),
    TreasuryController: Symbol.for("TreasuryController"),
    OrganizationController: Symbol.for("OrganizationController"),
    AuthController: Symbol.for("AuthController")
};
var ResponseMessage;
(function(ResponseMessage) {
    ResponseMessage["OrganizationCreated"] = "Organization is created successfully";
    ResponseMessage["OrganizationNotFound"] = "Organization is not found";
    ResponseMessage["OrganizationIdRequired"] = "Organization id is required";
    ResponseMessage["OrganizationUpdated"] = "Organization is updated successfully";
    ResponseMessage["UnAuthorizedAction"] = "Signature is invalid";
    ResponseMessage["UnknownServerError"] = "Internal server error";
    ResponseMessage["UserNotFound"] = "User is not found";
    ResponseMessage["UserUpdated"] = "User is updated";
    ResponseMessage["UserPublicKeyRequired"] = "User public key is required";
    ResponseMessage["ForbiddenRequest"] = "Forbidden attempt.";
})(ResponseMessage || (ResponseMessage = {}));
var Roles;
(function(Roles) {
    Roles["SuperAdmin"] = "Super Admin";
    Roles["Admin"] = "Admin";
    Roles["User"] = "User";
})(Roles || (Roles = {}));
var DesiredTokens;
(function(DesiredTokens) {
    DesiredTokens["Safe"] = "SAFE";
    DesiredTokens["Orange"] = "✺ORANGE";
})(DesiredTokens || (DesiredTokens = {}));
