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
        return _default // const user = await this.authService.getUserByPublicKey(req, res)
         // const favoriteOrganizationsMap = new Map(Object.entries(user.favoriteOrganizations));
         // response = response.map((org) => ({
         //     ...org,
         //     isFavorited: favoriteOrganizationsMap.has(org._id.toString()),
         // }));
        ;
    },
    organizationCollection: function() {
        return organizationCollection;
    },
    organizationHistoricalBalanceCollection: function() {
        return organizationHistoricalBalanceCollection;
    }
});
const _inversify = require("inversify");
const _utils = require("../../utils");
const _mongodb = require("mongodb");
const _types = require("../../utils/types");
const _models = require("../../models");
const _AuthManager = require("../auth/AuthManager");
const _dateandtime = /*#__PURE__*/ _interop_require_default(require("date-and-time"));
const _responseHandler = require("../../utils/helpers/responseHandler");
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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
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
const organizationHistoricalBalanceCollection = "OrganizationsHistoricalBalances";
class OrganizationManager {
    async createOrganization(req, res) {
        try {
            let parsedBody = (0, _utils.parseFormData)("accounts", req);
            parsedBody.createdDate = new Date().toDateString();
            await this.attachCommonFields(parsedBody);
            const db = req.app.locals.db;
            const io = req.app.locals.io; //socket connection
            if (parsedBody.isVerified && req.user.role !== _types.Roles.SuperAdmin) throw new _models.CustomError(_types.ResponseMessage.OrganizationNotFound, _models.ExceptionType.UnAuthorized);
            const collection = db.collection(organizationCollection);
            const createdOrg = await collection.insertOne(parsedBody);
            this.fetchOrganizationAnnualBalance(collection, parsedBody, db.collection(organizationHistoricalBalanceCollection), io, createdOrg.insertedId);
            return res.status(200).send(new _models.AppResponse(200, true, undefined, createdOrg.insertedId));
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    }
    async getOrganizationByName(req, res, next) {
        try {
            const orgId = req.params.id;
            const db = req.app.locals.db;
            const collection = db.collection(organizationCollection);
            const response = await collection.findOne({
                _id: new _mongodb.ObjectId(orgId)
            });
            if (!response) throw new _models.CustomError(_types.ResponseMessage.OrganizationNotFound, _models.ExceptionType.NotFound);
            if (response.isPrivate && response.createdBy !== req.user?.publicKey) throw new _models.CustomError(_types.ResponseMessage.OrganizationNotFound, _models.ExceptionType.NotFound);
            return res.status(200).send(new _models.AppResponse(200, true, undefined, response));
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    }
    async getAllOrganizations(req, res) {
        try {
            const pageIndex = parseInt(req.query.pageIndex, 10) || 1;
            const pageSize = parseInt(req.query.pageSize, 10);
            const aggregationPipeline = req.aggregationPipeline;
            const db = req.app.locals.db;
            const collection = db.collection(organizationCollection);
            let response = await collection.aggregate(aggregationPipeline).toArray();
            return res.status(200).send(new _models.AppResponse(200, true, undefined, new _models.Pagination(response[0].data, response[0].totalRecords[0].total, pageIndex, pageSize)));
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    }
    async updateOrganization(req, res) {
        try {
            const parsedBody = (0, _utils.parseFormData)("accounts", req);
            parsedBody.updatedDate = new Date().toDateString();
            await this.attachCommonFields(parsedBody);
            const orgId = req.params.id;
            const publicKey = req.headers.address;
            const db = req.app.locals.db;
            const io = req.app.locals.io; //socket connection
            const collection = db.collection(organizationCollection);
            const response = await collection.findOne({
                _id: new _mongodb.ObjectId(orgId)
            });
            if (!response) throw new _models.CustomError(_types.ResponseMessage.OrganizationNotFound, _models.ExceptionType.NotFound);
            if (!(req.user.role === _types.Roles.SuperAdmin || response.createdBy === publicKey)) throw new _models.CustomError(_types.ResponseMessage.ForbiddenRequest, _models.ExceptionType.UnAuthorized);
            const result = await collection.updateOne({
                _id: new _mongodb.ObjectId(orgId)
            }, {
                $set: parsedBody
            });
            parsedBody._id = orgId;
            this.fetchOrganizationAnnualBalance(collection, parsedBody, db.collection(organizationHistoricalBalanceCollection), io, result.upsertedId);
            return res.status(200).send(new _models.AppResponse(200, true, undefined, result.upsertedId));
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    }
    async deleteOrganization(req, res) {
        try {
            const orgId = req.params.id;
            const publicKey = req.headers.address;
            const db = req.app.locals.db;
            const collection = db.collection(organizationCollection);
            const response = await collection.findOne({
                _id: new _mongodb.ObjectId(orgId)
            });
            if (!response) throw new _models.CustomError(_types.ResponseMessage.OrganizationNotFound, _models.ExceptionType.NotFound);
            if (!(req.user.role === _types.Roles.SuperAdmin || response.createdBy === publicKey)) throw new _models.CustomError(_types.ResponseMessage.ForbiddenRequest, _models.ExceptionType.UnAuthorized);
            const result = await collection.updateOne({
                _id: new _mongodb.ObjectId(orgId)
            }, {
                $set: {
                    isDeleted: true
                }
            });
            return res.status(200).send(new _models.AppResponse(200, true, undefined, result.upsertedId));
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    }
    async addFavorites(req, res) {
        try {
            const orgId = req.params.organizationId;
            const publicKey = req.headers.address;
            if (!orgId || orgId.length > 24) throw new _models.CustomError(_types.ResponseMessage.OrganizationIdRequired, _models.ExceptionType.BadRequest);
            const db = req.app.locals.db;
            const orgs = db.collection(organizationCollection);
            const users = db.collection(_AuthManager.usersCollection);
            let organization = await orgs.findOne({
                _id: new _mongodb.ObjectId(orgId)
            });
            if (!organization) throw new _models.CustomError(_types.ResponseMessage.OrganizationNotFound, _models.ExceptionType.NotFound);
            users.createIndex({
                publicKey: 1
            }, {
                unique: true
            });
            const aggregation = [
                {
                    $match: {
                        publicKey,
                        [`favoriteOrganizations.${organization._id.toString()}`]: {
                            $exists: true
                        }
                    }
                },
                {
                    $project: {
                        _id: 1
                    }
                },
                {
                    $limit: 1
                }
            ];
            const update = {};
            // Check if organization already exists in favorites
            const existingFavorite = await users.aggregate(aggregation).toArray();
            if (existingFavorite.length > 0) update.$unset = {
                [`favoriteOrganizations.${organization._id.toString()}`]: 1
            };
            else update.$set = {
                [`favoriteOrganizations.${organization._id.toString()}`]: 1
            };
            const result = await users.updateOne({
                publicKey
            }, update);
            if (result.acknowledged) return res.status(200).send(new _models.AppResponse(200, true, undefined, organization._id));
            throw new _models.CustomError(_types.ResponseMessage.UnknownServerError, _models.ExceptionType.ServerError);
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    }
    async attachCommonFields(parsedBody) {
        parsedBody.image = await this.storageService.uploadByteArray(parsedBody.image);
        parsedBody.networks = {};
        parsedBody.isPrivate = parsedBody.isPrivate.toLowerCase() === 'true';
        parsedBody.isVerified = parsedBody.isVerified.toLowerCase() === 'true';
        parsedBody.isActive = false;
        parsedBody.isDeleted = false;
        Array.from(parsedBody.accounts).forEach((account)=>{
            if (!parsedBody.networks[account.chain]) {
                parsedBody.networks[account.chain] = account.chain;
            }
        });
    }
    async fetchOrganizationAnnualBalance(organizationCollection, newOrganization, balanceCollection, io, createdOrgId) {
        try {
            let historicalTreasury = {};
            let walletAddresses = [];
            const { accounts, name } = newOrganization;
            const orgObj = {
                wallets: []
            };
            accounts.forEach((account)=>{
                orgObj.wallets.push({
                    address: account.address,
                    network: account.chain
                });
            });
            await (0, _utils.rootParser)(orgObj, historicalTreasury, walletAddresses, name);
            historicalTreasury = Object.entries(historicalTreasury).sort(([key1], [key2])=>new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce((a, c)=>{
                a[c[0]] = c[1];
                return a;
            }, {});
            let responseObj = {
                name: name,
                orgId: newOrganization._id,
                addresses: walletAddresses,
                annual: Object.entries(historicalTreasury).length ? Object.entries(historicalTreasury).filter(([time, amount])=>Math.abs(_dateandtime.default.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce((a, c)=>{
                    a[c[0]] = c[1];
                    return a;
                }, {}) : {}
            };
            await balanceCollection.updateOne({
                orgId: newOrganization._id
            }, {
                $set: responseObj
            }, {
                upsert: true
            });
            await organizationCollection.updateOne({
                _id: createdOrgId
            }, {
                $set: {
                    isActive: true
                }
            });
            io.emit('annualBalanceFetched', {
                message: `Balance fething task completed successfully for organization id ${createdOrgId}`
            });
        } catch (error) {
            throw new Error(error);
        }
    }
    constructor(storageService){
        _define_property(this, "storageService", void 0);
        this.storageService = storageService;
    }
}
OrganizationManager = _ts_decorate([
    (0, _inversify.injectable)(),
    _ts_param(0, (0, _inversify.inject)(_types.TYPES.IStorageService))
], OrganizationManager);
const _default = OrganizationManager;
