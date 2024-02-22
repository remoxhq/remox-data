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
    default: function() {
        return configureRouter;
    },
    getContainer: function() {
        return getContainer;
    }
});
const _types = require("./types");
const _apiAttributes = require("./apiAttributes");
const _serviceProvider = require("./serviceProvider");
const _middlewares = require("../middlewares");
const _models = require("../models");
const _OrganizationFilter = require("../middlewares/filters/OrganizationFilter");
let diContainer = null;
function getContainer() {
    if (!diContainer) diContainer = (0, _serviceProvider.configureContainer)();
    return diContainer;
}
function configureRouter(app) {
    const diContainer = getContainer(); //DI Container configuration
    // inject controllers
    const treasuryController = diContainer.get(_types.TYPES.TreasuryController);
    const organizationController = diContainer.get(_types.TYPES.OrganizationController);
    const authController = diContainer.get(_types.TYPES.AuthController);
    // bind actions
    app.route(_apiAttributes.TreasuryRoute.GetAnnualTreasury).get(treasuryController.getAnnualTreasury.bind(treasuryController));
    app.route(_apiAttributes.TreasuryRoute.GetTransactions).post(treasuryController.getTransactions.bind(treasuryController));
    app.route(_apiAttributes.TreasuryRoute.GetAssets).post(treasuryController.getAssets.bind(treasuryController));
    app.route(_apiAttributes.OrganizationRoute.Create).post((0, _middlewares.checkUserJwt)(), (0, _middlewares.validateBody)(_models.organizationShcema, "accounts"), organizationController.create.bind(organizationController));
    app.route(_apiAttributes.OrganizationRoute.GetByName).get(organizationController.getByName.bind(organizationController));
    app.route(_apiAttributes.OrganizationRoute.GetAll).get((0, _middlewares.authenticateUserOrAllowAnonymous)(), (0, _OrganizationFilter.addOrganizationFilter)(), organizationController.getAll.bind(organizationController));
    app.route(_apiAttributes.OrganizationRoute.Update).put((0, _middlewares.checkUserJwt)(), (0, _middlewares.validateBody)(_models.organizationShcema, "accounts"), organizationController.update.bind(organizationController));
    app.route(_apiAttributes.OrganizationRoute.AddFavorites).post((0, _middlewares.checkUserJwt)(), organizationController.addFavorites.bind(organizationController));
    app.route(_apiAttributes.OrganizationRoute.Delete).delete((0, _middlewares.checkUserJwt)(), organizationController.delete.bind(organizationController));
    app.route(_apiAttributes.AuthRoute.SingIn).post((0, _middlewares.checkUserSignature)(), authController.signIn.bind(authController));
    app.route(_apiAttributes.AuthRoute.UpdateRole).post((0, _middlewares.checkUserPermission)(_types.Roles.SuperAdmin), authController.updateRole.bind(authController));
    app.route(_apiAttributes.AuthRoute.UserFavOrgs).get((0, _middlewares.checkUserJwt)(), authController.getUserFavOrgs.bind(authController));
}
