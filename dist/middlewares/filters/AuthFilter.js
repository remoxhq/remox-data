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
    authenticateUserOrAllowAnonymous: function() {
        return authenticateUserOrAllowAnonymous;
    },
    checkAccessKey: function() {
        return checkAccessKey;
    },
    checkUserJwt: function() {
        return checkUserJwt;
    },
    checkUserPermission: function() {
        return checkUserPermission;
    },
    checkUserSignature: function() {
        return checkUserSignature;
    }
});
const _ethereumjsutil = require("ethereumjs-util");
const _types = require("../../utils/types");
const _jsonwebtoken = /*#__PURE__*/ _interop_require_default(require("jsonwebtoken"));
const _models = require("../../models");
const _responseHandler = require("../../utils/helpers/responseHandler");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const checkUserSignature = ()=>async (req, res, next)=>{
        try {
            let accessKey = req.headers.accesskey?.toString();
            if (!accessKey) throw new _models.CustomError(_types.ResponseMessage.UnAuthorizedAction, _models.ExceptionType.UnAuthenticated);
            const decoded = _jsonwebtoken.default.verify(accessKey, process.env.AUTH_ACCESS_KEY);
            req.user = {
                publicKey: decoded.address
            };
            next();
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    };
const checkUserJwt = ()=>async (req, res, next)=>{
        try {
            const token = req.headers.authorization?.toString();
            const createdBy = req.headers.address;
            if (!token) throw new _models.CustomError(_types.ResponseMessage.UnAuthorizedAction, _models.ExceptionType.UnAuthenticated);
            _jsonwebtoken.default.verify(token.split(" ")[1], process.env.AUTH_SECRET_KEY, (err, decoded)=>{
                if (err || !decoded) throw new _models.CustomError(_types.ResponseMessage.UnAuthorizedAction, _models.ExceptionType.UnAuthenticated);
                if ((0, _ethereumjsutil.toChecksumAddress)(createdBy) !== (0, _ethereumjsutil.toChecksumAddress)(decoded.publicKey)) throw new _models.CustomError(_types.ResponseMessage.UnAuthorizedAction, _models.ExceptionType.UnAuthenticated);
                req.user = {
                    role: decoded.role,
                    publicKey: decoded.publicKey
                };
                next();
            });
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    };
const checkUserPermission = (role)=>async (req, res, next)=>{
        try {
            const token = req.headers.authorization?.toString();
            const createdBy = req.headers.address;
            if (!token) throw new _models.CustomError(_types.ResponseMessage.UnAuthorizedAction, _models.ExceptionType.UnAuthenticated);
            _jsonwebtoken.default.verify(token.split(" ")[1], process.env.AUTH_SECRET_KEY, (err, decoded)=>{
                if (err || !decoded) throw new _models.CustomError(_types.ResponseMessage.UnAuthorizedAction, _models.ExceptionType.UnAuthenticated);
                if (role !== decoded.role || createdBy !== (0, _ethereumjsutil.toChecksumAddress)(decoded.publicKey)) throw new _models.CustomError(_types.ResponseMessage.UnAuthorizedAction, _models.ExceptionType.UnAuthenticated);
                next();
            });
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    };
const checkAccessKey = ()=>async (req, res, next)=>{
        try {
            const accessKey = req.headers.accesskey;
            if (!accessKey || accessKey !== process.env.API_ACCESS_KEY) throw new _models.CustomError(_types.ResponseMessage.ForbiddenRequest, _models.ExceptionType.UnAuthorized);
            else next();
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    };
const authenticateUserOrAllowAnonymous = ()=>async (req, res, next)=>{
        try {
            const createdBy = req.headers.address;
            if (createdBy) await checkUserJwt()(req, res, next);
            else next();
        } catch (error) {
            return (0, _responseHandler.handleError)(res, error);
        }
    };
