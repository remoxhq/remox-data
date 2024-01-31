"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "addOrganizationFilter", {
    enumerable: true,
    get: function() {
        return addOrganizationFilter;
    }
});
const _utils = require("../../utils");
const _types = require("../../utils/types");
const _mongodb = require("mongodb");
const addOrganizationFilter = ()=>async (req, res, next)=>{
        try {
            const diContainer = (0, _utils.getContainer)();
            const usrPulicKey = req.headers.address;
            const aggregationPipeline = [];
            const match = {};
            const field = {};
            if (req.query.chain) match[`networks.${req.query.chain}`] = {
                $exists: true
            };
            if (req.query.searchParam) match.name = {
                $regex: req.query.searchParam,
                $options: 'i'
            };
            if (req.query.mine && usrPulicKey) match.createdBy = usrPulicKey;
            if (usrPulicKey) {
                const authService = diContainer.get(_types.TYPES.IAuthService);
                const user = await authService.getUserByPublicKey(req, res);
                field[`isFavorited`] = {
                    $in: [
                        '$_id',
                        Object.keys(user.favoriteOrganizations).map((id)=>new _mongodb.ObjectId(id))
                    ]
                };
            }
            if (req.query.favOnly) match.isFavorited = true;
            aggregationPipeline.push({
                $addFields: field
            });
            aggregationPipeline.push({
                $match: match
            });
            req.aggregationPipeline = aggregationPipeline;
            next();
        } catch (err) {
            next(err);
        }
    };
