import { Container } from "inversify";
import { TYPES } from "./types";
import IOrganizationService from "../services/organizations/IOrganizationService";
import ITreasuryService from "../services/treasuries/ITreasuryService";
import OrganizationManager from "../services/organizations/OrganizationManager";
import TreasuryManager from "../services/treasuries/TreasuryManager";
import { OrganizationController, TreasuryController } from "../controllers";

const configureContainer = (): Container => {
    const diContainer = new Container();

    diContainer.bind<IOrganizationService>(TYPES.IOrganizationService).to(OrganizationManager);
    diContainer.bind<ITreasuryService>(TYPES.ITreasuryService).to(TreasuryManager);
    diContainer.bind<TreasuryController>(TYPES.TreasuryController).to(TreasuryController)
    diContainer.bind<OrganizationController>(TYPES.OrganizationController).to(OrganizationController)
    return diContainer;
}

export { configureContainer };