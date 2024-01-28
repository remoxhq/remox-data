import { TYPES } from "./types";
import { OrganizationRoute, TreasuryRoute } from "./apiAttributes";
import { OrganizationController, TreasuryController } from "../controllers";
import { configureContainer } from "./serviceProvider";
import multer from "multer";
import { validateBody } from "../middlewares";
import { Account, organizationShcema } from "../models";

export default function configureRouter(app: any) {
    const diContainer = configureContainer(); //DI Container configuration

    // inject controllers
    const treasuryController = diContainer.get<TreasuryController>(TYPES.TreasuryController);
    const organizationController = diContainer.get<OrganizationController>(TYPES.OrganizationController);

    // bind actions
    app.route(TreasuryRoute.GetAnnualTreasury)
        .get(treasuryController.getAnnualTreasury.bind(treasuryController))

    app.route(OrganizationRoute.Create)
        .post(
            multer().any(),
            validateBody(organizationShcema, "accounts")<Account>,
            organizationController.create.bind(organizationController))
}