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
            const pageIndex = parseInt(req.query.pageIndex, 10) || 0;
            const pageSize = parseInt(req.query.pageSize, 10) || Number.MAX_SAFE_INTEGER;
            const aggregationPipeline = [];
            let match = {};
            const field = {};
            if (req.query.chain) match[`networks.${req.query.chain}`] = {
                $exists: true
            };
            if (req.query.searchParam) match.name = {
                $regex: req.query.searchParam,
                $options: 'i'
            };
            if (req.query.mine) match.createdBy = usrPulicKey;
            else if (req.user && req.user?.role !== _types.Roles.SuperAdmin) match.isPrivate = false;
            if (usrPulicKey) {
                const authService = diContainer.get(_types.TYPES.IAuthService);
                const user = await authService.getUserByPublicKey(req, res);
                field[`isFavorited`] = {
                    $in: [
                        '$_id',
                        Object.keys(user.favoriteOrganizations).map((id)=>new _mongodb.ObjectId(id))
                    ]
                };
            } else field[`isFavorited`] = false;
            if (req.query.favOnly) match.isFavorited = true;
            match.isDeleted = false;
            aggregationPipeline.push({
                $addFields: field
            });
            aggregationPipeline.push({
                $match: match
            });
            aggregationPipeline.push({
                $facet: {
                    totalRecords: [
                        {
                            $count: "total"
                        }
                    ],
                    data: [
                        {
                            $sort: {
                                balance: -1
                            }
                        },
                        {
                            $skip: pageIndex
                        },
                        {
                            $limit: pageSize
                        }
                    ]
                }
            });
            req.aggregationPipeline = aggregationPipeline;
            next();
        } catch (err) {
            next(err);
        }
    };
