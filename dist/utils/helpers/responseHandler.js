"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "handleError", {
    enumerable: true,
    get: function() {
        return handleError;
    }
});
const _models = require("../../models");
function handleError(res, error) {
    const { statusCode, message } = error;
    return res.status(statusCode || 500).send(new _models.AppResponse(statusCode || 500, false, message || 'Internal Server Error'));
}
