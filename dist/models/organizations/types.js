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
const organizationShcema = _joi.default.object({
    name: _joi.default.string().alphanum().min(3).max(30).required().label("Organization name")
});
