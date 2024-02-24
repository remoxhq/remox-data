"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "AppResponse", {
    enumerable: true,
    get: function() {
        return AppResponse;
    }
});
_export_star(require("./errors/types"), exports);
_export_star(require("./treasuries/types"), exports);
_export_star(require("./organizations/types"), exports);
_export_star(require("./pagination"), exports);
_export_star(require("./users/types"), exports);
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
class AppResponse {
    constructor(statusCode, success, error, result){
        _define_property(this, "statusCode", void 0);
        _define_property(this, "result", void 0);
        _define_property(this, "success", void 0);
        _define_property(this, "error", void 0);
        this.statusCode = statusCode;
        this.result = result;
        this.success = success;
        this.error = error;
    }
}
