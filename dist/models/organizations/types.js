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
    name: _joi.default.string().alphanum().required().label("Account name"),
    address: _joi.default.string().alphanum().required().label("Account address"),
    chain: _joi.default.string().required().label("Account chain")
});
const organizationShcema = _joi.default.object({
    name: _joi.default.string().alphanum().min(3).max(10).required().label("Organization name"),
    image: _joi.default.any().meta({
        accept: 'image/*'
    }).custom((value, helpers)=>{
        if (value && ![
            "image/jpeg",
            "image/png",
            "image/svg+xml"
        ].some((x)=>x === value.mimetype)) {
            return helpers.error('File must be an image/jpeg, image/png, image/svg+xml');
        }
        return value;
    }).label("Organization image"),
    dashboardLink: _joi.default.string().alphanum().min(3).max(30).required().label("Organization dashboard link"),
    website: _joi.default.string().label("Organization website url"),
    github: _joi.default.string().label("Organization github url"),
    discord: _joi.default.string().label("Organization discord url"),
    twitter: _joi.default.string().label("Organization twitter url"),
    createdBy: _joi.default.string().label("Organization Creator wallet address").required(),
    isPrivate: _joi.default.boolean(),
    isDeleted: _joi.default.boolean(),
    isVerified: _joi.default.boolean(),
    createdDate: _joi.default.string(),
    updatedDate: _joi.default.string(),
    accounts: _joi.default.array().items(accountSchema).required()
});
