"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return BadRequestError;
    }
});
const _types = require("./types");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
var _BadRequestError;
var BadRequestError;
BadRequestError = (_BadRequestError = class BadRequestError extends _types.CustomError {
    get errors() {
        return [
            {
                message: this.message,
                context: this._context
            }
        ];
    }
    get statusCode() {
        return this._code;
    }
    constructor(params){
        const { code, message, logging } = params || {};
        super(message || "Bad request");
        _define_property(this, "_code", void 0);
        _define_property(this, "_context", void 0);
        this._code = code || BadRequestError._statusCode;
        this._context = params?.context || {};
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}, _define_property(_BadRequestError, "_statusCode", 400), _BadRequestError);
