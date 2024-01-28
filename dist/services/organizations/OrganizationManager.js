"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return _default;
    }
});
const _inversify = require("inversify");
const _utils = require("../../utils");
const _types = require("../../utils/types");
const _models = require("../../models");
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
const organizationCollection = "Organizations";
let OrganizationManager = class OrganizationManager {
    async createOrganization(req, res) {
        const parsedBody = (0, _utils.parseFormData)("accounts", req);
        parsedBody.image = await this.storageService.uploadByteArray(parsedBody.image);
        const db = req.app.locals.db;
        const collection = db.collection(organizationCollection);
        await collection.insertOne(parsedBody);
        return res.status(200).send(_types.ResponseMessage.OrganizationCreated);
    }
    async getOrganizationByName(req, res) {
        const orgName = req.params.name;
        if (!orgName) return res.status(404).send(_types.ResponseMessage.OrganizationNotFound);
        const db = req.app.locals.db;
        const collection = db.collection(organizationCollection);
        const response = await collection.findOne({
            name: orgName
        });
        if (!response) return res.status(404).send(_types.ResponseMessage.OrganizationNotFound);
        return res.status(200).send(response);
    }
    async getAllOrganizations(req, res) {
        const pageIndex = parseInt(req.query.pageIndex, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const db = req.app.locals.db;
        const collection = db.collection(organizationCollection);
        const response = await collection.find().skip((pageIndex - 1) * pageSize).limit(pageSize).toArray();
        if (!response) return res.status(404).send(_types.ResponseMessage.OrganizationNotFound);
        return res.status(200).send(new _models.Pagination(response, await collection.countDocuments(), pageIndex, pageSize));
    }
    constructor(storageService){
        _define_property(this, "storageService", void 0);
        this.storageService = storageService;
    }
};
OrganizationManager = _ts_decorate([
    (0, _inversify.injectable)(),
    _ts_param(0, (0, _inversify.inject)(_types.TYPES.IStorageService))
], OrganizationManager);
const _default = OrganizationManager;
