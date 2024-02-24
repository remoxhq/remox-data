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
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const checkUserSignature = ()=>async (req, res, next)=>{
        try {
            let accessKey = req.headers.accesskey?.toString();
            if (!accessKey) return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
            const decoded = _jsonwebtoken.default.verify(accessKey, process.env.AUTH_SECRET_KEY);
            req.user = {
                publicKey: decoded.address
            };
            next();
        } catch (err) {
            return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
        }
    };
const checkUserJwt = ()=>async (req, res, next)=>{
        try {
            const token = req.headers.authorization?.toString();
            const createdBy = req.headers.address;
            if (!token) return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
            _jsonwebtoken.default.verify(token.split(" ")[1], process.env.AUTH_SECRET_KEY, (err, decoded)=>{
                if (err || !decoded) return res.status(401).json(_types.ResponseMessage.UnAuthorizedAction);
                if ((0, _ethereumjsutil.toChecksumAddress)(createdBy) !== (0, _ethereumjsutil.toChecksumAddress)(decoded.publicKey)) return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
                req.user = {
                    role: decoded.role,
                    publicKey: decoded.publicKey
                };
                next();
            });
        } catch (err) {
            return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
        }
    };
const checkUserPermission = (role)=>async (req, res, next)=>{
        try {
            const token = req.headers.authorization?.toString();
            const createdBy = req.headers.address;
            if (!token) return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
            _jsonwebtoken.default.verify(token.split(" ")[1], process.env.AUTH_SECRET_KEY, (err, decoded)=>{
                if (err || !decoded) return res.status(401).json(_types.ResponseMessage.UnAuthorizedAction);
                if (role !== decoded.role || createdBy !== (0, _ethereumjsutil.toChecksumAddress)(decoded.publicKey)) return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
                next();
            });
        } catch (err) {
            return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
        }
    };
const authenticateUserOrAllowAnonymous = ()=>async (req, res, next)=>{
        try {
            const createdBy = req.headers.address;
            if (createdBy) await checkUserJwt()(req, res, next);
            else next();
        } catch (err) {
            return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
        }
    };
