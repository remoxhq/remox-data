"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "covalentPortfolioRequest", {
    enumerable: true,
    get: function() {
        return covalentPortfolioRequest;
    }
});
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
const _dotenv = require("dotenv");
_export_star(require("./covalent-networks"), exports);
_export_star(require("./types"), exports);
_export_star(require("@covalenthq/client-sdk"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
(0, _dotenv.config)();
const covalentPortfolioRequest = async (wallet)=>{
    return await _axios.default.get(`https://api.covalenthq.com/v1/${wallet.chain}/address/${wallet.address}/balances_v2/?key=${process.env.COVALENT_API_KEY}&`);
};
