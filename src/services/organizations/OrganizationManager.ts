import { injectable } from "inversify";
import IOrganizationService from "./IOrganizationService";

@injectable()
class OrganizationManager implements IOrganizationService {
    createOrganiztion(): void { }
}

export default OrganizationManager;