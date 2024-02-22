import { Roles, TYPES } from "./types";
import { AuthRoute, OrganizationRoute, TreasuryRoute } from "./apiAttributes";
import { AuthController, OrganizationController, TreasuryController } from "../controllers";
import { configureContainer } from "./serviceProvider";
import { authenticateUserOrAllowAnonymous, checkUserJwt, checkUserPermission, checkUserSignature, validateBody } from "../middlewares";
import { organizationShcema } from "../models";
import { addOrganizationFilter } from "../middlewares/filters/OrganizationFilter";
import { Container } from "inversify";

let diContainer: Container | null = null;

export function getContainer(): Container {
    if (!diContainer)
        diContainer = configureContainer();
    return diContainer;
}

export default function configureRouter(app: any) {
    const diContainer = getContainer(); //DI Container configuration

    // inject controllers
    const treasuryController = diContainer.get<TreasuryController>(TYPES.TreasuryController);
    const organizationController = diContainer.get<OrganizationController>(TYPES.OrganizationController);
    const authController = diContainer.get<AuthController>(TYPES.AuthController);

    // bind actions
    app.route(TreasuryRoute.GetAnnualTreasury)
        .get(treasuryController.getAnnualTreasury.bind(treasuryController))

    app.route(TreasuryRoute.GetTransactions)
        .post(treasuryController.getTransactions.bind(treasuryController))

    app.route(TreasuryRoute.GetAssets)
        .post(treasuryController.getAssets.bind(treasuryController))

    app.route(OrganizationRoute.Create)
        .post(checkUserJwt(),
            validateBody(organizationShcema, "accounts"),
            organizationController.create.bind(organizationController))

    app.route(OrganizationRoute.GetByName)
        .get(organizationController.getByName.bind(organizationController))

    app.route(OrganizationRoute.GetAll)
        .get(authenticateUserOrAllowAnonymous(),
            addOrganizationFilter(),
            organizationController.getAll.bind(organizationController))

    app.route(OrganizationRoute.Update)
        .put(checkUserJwt(),
            validateBody(organizationShcema, "accounts"),
            organizationController.update.bind(organizationController))

    app.route(OrganizationRoute.AddFavorites)
        .post(checkUserJwt(),
            organizationController.addFavorites.bind(organizationController))

    app.route(OrganizationRoute.Delete)
        .delete(checkUserJwt(),
            organizationController.delete.bind(organizationController))

    app.route(AuthRoute.SingIn)
        .post(checkUserSignature(),
            authController.signIn.bind(authController))

    app.route(AuthRoute.UpdateRole)
        .post(checkUserPermission(Roles.SuperAdmin),
            authController.updateRole.bind(authController))

    app.route(AuthRoute.UserFavOrgs)
        .get(checkUserJwt(),
            authController.getUserFavOrgs.bind(authController))
}