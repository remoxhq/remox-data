import { TYPES } from "./types";
import { OrganizationRoute, TreasuryRoute } from "./apiAttributes";
import { OrganizationController, TreasuryController } from "../controllers";
import { configureContainer } from "./serviceProvider";
import { validateBody } from "../middlewares";
import { organizationShcema } from "../models";
import { addOrganizationFilter } from "../middlewares/filters/OrganizationFilter";

export default function configureRouter(app: any) {
    const diContainer = configureContainer(); //DI Container configuration

    // inject controllers
    const treasuryController = diContainer.get<TreasuryController>(TYPES.TreasuryController);
    const organizationController = diContainer.get<OrganizationController>(TYPES.OrganizationController);

    // bind actions
    app.route(TreasuryRoute.GetAnnualTreasury)
        .get(treasuryController.getAnnualTreasury.bind(treasuryController))

    app.route(OrganizationRoute.Create)
        .post(validateBody(organizationShcema, "accounts"),
            organizationController.create.bind(organizationController))

    app.route(OrganizationRoute.GetByName)
        .get(organizationController.getByName.bind(organizationController))

    app.route(OrganizationRoute.GetAll)
        .get(addOrganizationFilter(), organizationController.getAll.bind(organizationController))

    app.route(OrganizationRoute.Update)
        .put(validateBody(organizationShcema, "accounts"),
            organizationController.update.bind(organizationController))
}