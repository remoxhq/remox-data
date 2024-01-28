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
    CustomError: function() {
        return CustomError;
    },
    ExceptionType: function() {
        return ExceptionType;
    }
});
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
var ExceptionType;
(function(ExceptionType) {
    ExceptionType[ExceptionType["BadRequest"] = 400] = "BadRequest";
    ExceptionType[ExceptionType["UnAuthenticated"] = 401] = "UnAuthenticated";
    ExceptionType[ExceptionType["UnAuthorized"] = 403] = "UnAuthorized";
    ExceptionType[ExceptionType["NotFound"] = 404] = "NotFound";
})(ExceptionType || (ExceptionType = {}));
class CustomError {
    constructor(message, type){
        _define_property(this, "statusCode", void 0);
        _define_property(this, "message", void 0);
        this.statusCode = type;
        this.message = message;
    }
}
