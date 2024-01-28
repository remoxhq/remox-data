"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return configureRouter;
    }
});
const _types = require("./types");
const _apiAttributes = require("./apiAttributes");
const _serviceProvider = require("./serviceProvider");
const _multer = /*#__PURE__*/ _interop_require_default(require("multer"));
const _middlewares = require("../middlewares");
const _models = require("../models");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function configureRouter(app) {
    const diContainer = (0, _serviceProvider.configureContainer)(); //DI Container configuration
    // inject controllers
    const treasuryController = diContainer.get(_types.TYPES.TreasuryController);
    const organizationController = diContainer.get(_types.TYPES.OrganizationController);
    // bind actions
    app.route(_apiAttributes.TreasuryRoute.GetAnnualTreasury).get(treasuryController.getAnnualTreasury.bind(treasuryController));
    app.route(_apiAttributes.OrganizationRoute.Create).post((0, _multer.default)().any(), (0, _middlewares.validateBody)(_models.organizationShcema, "accounts"), organizationController.create.bind(organizationController));
}
