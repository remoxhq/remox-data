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
    addFavOrganizationFilter: function() {
        return addFavOrganizationFilter;
    },
    addOrganizationFilter: function() {
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
            if (req.query.mine) filter.createdBy = {
                $regex: req.query.mine
            };
            req.filter = filter;
            next();
        } catch (err) {
            next(err);
        }
    };
const addFavOrganizationFilter = ()=>async (req, res, next)=>{
        try {
            const filter = {};
            if (req.query.chain) {
                const chain = req.query.chain;
                filter['favOrgs'] = {
                    $elemMatch: {
                        [`networks.${chain}`]: {
                            $regex: chain
                        }
                    }
                };
            }
            if (req.query.searchParam) {
                filter['favOrgs'] = {
                    $elemMatch: {
                        [`name`]: {
                            $regex: req.query.searchParam,
                            $options: 'i'
                        }
                    }
                };
            }
            req.filter = filter;
            next();
        } catch (err) {
            next(err);
        }
    };
