"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "OrganizationController", {
    enumerable: true,
    get: function() {
        return OrganizationController;
    }
});
const _inversify = require("inversify");
const _types = require("../utils/types");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
class OrganizationController {
    async create(req, res) {
        await this.organizationService.createOrganization(req, res);
    }
    async getByName(req, res, next) {
        await this.organizationService.getOrganizationByName(req, res, next);
    }
    async getAll(req, res) {
        await this.organizationService.getAllOrganizations(req, res);
    }
    async update(req, res) {
        await this.organizationService.updateOrganization(req, res);
    }
    async delete(req, res) {
        await this.organizationService.deleteOrganization(req, res);
    }
    async addFavorites(req, res) {
        await this.organizationService.addFavorites(req, res);
    }
    constructor(organizationService){
        _define_property(this, "organizationService", void 0);
        this.organizationService = organizationService;
    }
}
OrganizationController = _ts_decorate([
    (0, _inversify.injectable)(),
    _ts_param(0, (0, _inversify.inject)(_types.TYPES.IOrganizationService))
], OrganizationController);
