import { Container } from "inversify";
import { TYPES } from "./types";
import IOrganizationService from "../services/organizations/IOrganizationService";
import ITreasuryService from "../services/treasuries/ITreasuryService";
import OrganizationManager from "../services/organizations/OrganizationManager";
import TreasuryManager from "../services/treasuries/TreasuryManager";
import { OrganizationController, TreasuryController } from "../controllers";
import StorageManager from "../services/storage/StorageManager";
import IStorageService from "../services/storage/IStorageService";
import IAuthService from "../services/auth/IAuthService";
import AuthManager from "../services/auth/AuthManager";
import { AuthController } from "../controllers/AuthController";

const configureContainer = (): Container => {
    const diContainer = new Container();

    diContainer.bind<IOrganizationService>(TYPES.IOrganizationService).to(OrganizationManager);
    diContainer.bind<ITreasuryService>(TYPES.ITreasuryService).to(TreasuryManager);
    diContainer.bind<IStorageService>(TYPES.IStorageService).to(StorageManager);
    diContainer.bind<IAuthService>(TYPES.IAuthService).to(AuthManager);

    diContainer.bind<TreasuryController>(TYPES.TreasuryController).to(TreasuryController)
    diContainer.bind<OrganizationController>(TYPES.OrganizationController).to(OrganizationController)
    diContainer.bind<AuthController>(TYPES.AuthController).to(AuthController)

    return diContainer;
}

export { configureContainer };