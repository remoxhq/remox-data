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
        return _default;
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
        let parsedBody = (0, _utils.parseFormData)("accounts", req);
        parsedBody.createdDate = new Date().toDateString();
        await this.attachCommonFields(parsedBody);
        const db = req.app.locals.db;
        const io = req.app.locals.io; //socket connection
        const collection = db.collection(organizationCollection);
        // await collection.insertOne(parsedBody)
        await this.fetchOrganizationAnnualBalance(collection, parsedBody, db.collection(organizationHistoricalBalanceCollection), io);
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
        const pageSize = parseInt(req.query.pageSize, 10) || 20;
        const aggregationPipeline = req.aggregationPipeline;
        const db = req.app.locals.db;
        const collection = db.collection(organizationCollection);
        let response = await collection.aggregate(aggregationPipeline).skip((pageIndex - 1) * pageSize).limit(pageSize).toArray();
        // const user = await this.authService.getUserByPublicKey(req, res)
        // const favoriteOrganizationsMap = new Map(Object.entries(user.favoriteOrganizations));
        // response = response.map((org) => ({
        //     ...org,
        //     isFavorited: favoriteOrganizationsMap.has(org._id.toString()),
        // }));
        if (!response) return res.status(404).send(_types.ResponseMessage.OrganizationNotFound);
        return res.status(200).send(new _models.Pagination(response, await collection.countDocuments(), pageIndex, pageSize));
    }
    async updateOrganization(req, res) {
        const parsedBody = (0, _utils.parseFormData)("accounts", req);
        const orgName = req.params.name;
        parsedBody.updatedDate = new Date().toDateString();
        await this.attachCommonFields(parsedBody);
        const db = req.app.locals.db;
        const collection = db.collection(organizationCollection);
        const result = await collection.updateOne({
            name: orgName
        }, {
            $set: parsedBody
        });
        if (result.modifiedCount > 0) return res.json({
            message: _types.ResponseMessage.OrganizationUpdated
        });
        return res.status(404).json(_types.ResponseMessage.OrganizationNotFound);
    }
    async addFavorites(req, res) {
        const orgId = req.params.organizationId;
        const publicKey = req.headers.address;
        if (!orgId || orgId.length > 24) return res.status(422).json({
            message: _types.ResponseMessage.OrganizationIdRequired
        });
        const db = req.app.locals.db;
        const orgs = db.collection(organizationCollection);
        const users = db.collection(_AuthManager.usersCollection);
        let organization = await orgs.findOne({
            _id: new _mongodb.ObjectId(orgId)
        });
        if (!organization) return res.json({
            message: _types.ResponseMessage.OrganizationNotFound
        });
        users.createIndex({
            publicKey: 1
        }, {
            unique: true
        });
        const result = await users.updateOne({
            publicKey: publicKey
        }, {
            $set: {
                [`favoriteOrganizations.${organization._id.toString()}`]: true
            }
        });
        if (result.acknowledged) return res.json({
            message: _types.ResponseMessage.UserUpdated
        });
        return res.status(500).json(_types.ResponseMessage.UnknownServerError);
    }
    async attachCommonFields(parsedBody) {
        parsedBody.image = await this.storageService.uploadByteArray(parsedBody.image);
        parsedBody.networks = {};
        parsedBody.isDeleted = false;
        parsedBody.isVerified = false;
        Array.from(parsedBody.accounts).forEach((account)=>{
            if (!parsedBody.networks[account.chain]) {
                parsedBody.networks[account.chain] = account.chain;
            }
        });
    }
    async fetchOrganizationAnnualBalance(collection, newOrganization, balanceCollection, io) {
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
                addresses: walletAddresses,
                annual: Object.entries(historicalTreasury).length ? Object.entries(historicalTreasury).filter(([time, amount])=>Math.abs(_dateandtime.default.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce((a, c)=>{
                    a[c[0]] = c[1];
                    return a;
                }, {}) : {}
            };
            await balanceCollection.insertOne(responseObj);
            console.log("aue");
            io.emit('annualBalanceFetched', {
                message: 'Balance fething task completed successfully'
            });
            return {};
        } catch (error) {
            throw new Error(error);
        }
    }
    constructor(storageService, authService){
        _define_property(this, "storageService", void 0);
        _define_property(this, "authService", void 0);
        this.storageService = storageService;
        this.authService = authService;
    }
}
OrganizationManager = _ts_decorate([
    (0, _inversify.injectable)(),
    _ts_param(0, (0, _inversify.inject)(_types.TYPES.IStorageService)),
    _ts_param(1, (0, _inversify.inject)(_types.TYPES.IAuthService))
], OrganizationManager);
const _default = OrganizationManager;
