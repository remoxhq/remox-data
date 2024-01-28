"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
require("reflect-metadata");
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _dotenv = require("dotenv");
const _utils = require("./utils");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const app = (0, _express.default)();
(0, _dotenv.config)(); // env files configuration
(0, _utils.startServer)(app);
