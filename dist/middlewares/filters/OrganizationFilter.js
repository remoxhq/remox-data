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
const addOrganizationFilter = ()=>async (req, res, next)=>{
        try {
            const filter = {};
            if (req.query.chain) {
                const chain = req.query.chain;
                filter[`networks.${chain}`] = {
                    $exists: true
                };
            }
            if (req.query.searchParam) filter.name = {
                $regex: req.query.searchParam,
                $options: 'i'
            };
            req.filter = filter;
            next();
        } catch (err) {
            next(err);
        }
    };
