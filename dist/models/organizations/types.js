"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "organizationShcema", {
    enumerable: true,
    get: function() {
        return organizationShcema;
    }
});
const _joi = /*#__PURE__*/ _interop_require_default(require("joi"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const accountSchema = _joi.default.object({
    name: _joi.default.string().regex(/^[a-zA-Z0-9]+$/).min(3).max(10).required().label("Account name"),
    address: _joi.default.string().regex(/^[a-zA-Z0-9]+$/).max(42).required().label("Account address"),
    chain: _joi.default.string().min(1).required().label("Account chain")
});
const organizationShcema = _joi.default.object({
    name: _joi.default.string().min(3).max(40).regex(/^(?:[a-zA-Z0-9-_.]|['"](?=[a-zA-Z0-9-_.]+['"]))+$/).required().label("Organization name"),
    image: _joi.default.any().meta({
        accept: 'image/*'
    }).custom((value, helpers)=>{
        if (value && ![
            "image/jpeg",
            "image/png",
            "image/svg+xml",
            "image/webp"
        ].some((x)=>x === value.mimetype)) {
            return helpers.error('File must be an image/jpeg, image/png, image/svg+xml');
        }
        return value;
    }).label("Organization image"),
    dashboardLink: _joi.default.string().min(3).regex(/^[a-z0-9]+$/).required().label("Organization dashboard link"),
    website: _joi.default.optional().label("Organization website url"),
    github: _joi.default.optional().label("Organization github url"),
    discord: _joi.default.optional().label("Organization discord url"),
    twitter: _joi.default.optional().label("Organization twitter url"),
    createdBy: _joi.default.string().label("Organization Creator wallet address"),
    governanceSlug: _joi.default.optional().label("Governance slug"),
    isPrivate: _joi.default.boolean(),
    isDeleted: _joi.default.boolean(),
    isVerified: _joi.default.boolean(),
    createdDate: _joi.default.string(),
    updatedDate: _joi.default.string(),
    accounts: _joi.default.array().items(accountSchema).required()
});
