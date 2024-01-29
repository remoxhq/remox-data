"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "configureContainer", {
    enumerable: true,
    get: function() {
        return configureContainer;
    }
});
const _inversify = require("inversify");
const _types = require("./types");
const _OrganizationManager = /*#__PURE__*/ _interop_require_default(require("../services/organizations/OrganizationManager"));
const _TreasuryManager = /*#__PURE__*/ _interop_require_default(require("../services/treasuries/TreasuryManager"));
const _controllers = require("../controllers");
const _StorageManager = /*#__PURE__*/ _interop_require_default(require("../services/storage/StorageManager"));
const _AuthManager = /*#__PURE__*/ _interop_require_default(require("../services/auth/AuthManager"));
const _AuthController = require("../controllers/AuthController");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const configureContainer = ()=>{
    const diContainer = new _inversify.Container();
    diContainer.bind(_types.TYPES.IOrganizationService).to(_OrganizationManager.default);
    diContainer.bind(_types.TYPES.ITreasuryService).to(_TreasuryManager.default);
    diContainer.bind(_types.TYPES.IStorageService).to(_StorageManager.default);
    diContainer.bind(_types.TYPES.IAuthService).to(_AuthManager.default);
    diContainer.bind(_types.TYPES.TreasuryController).to(_controllers.TreasuryController);
    diContainer.bind(_types.TYPES.OrganizationController).to(_controllers.OrganizationController);
    diContainer.bind(_types.TYPES.AuthController).to(_AuthController.AuthController);
    return diContainer;
};
