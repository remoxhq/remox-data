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
const _ethsigutil = require("@metamask/eth-sig-util");
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
            let signature = req.headers.signature?.toString();
            let signedData = req.headers.signeddata?.toString();
            let createdBy = req.headers.address;
            if (!signature || !signedData) return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
            const pk = (0, _ethsigutil.recoverPersonalSignature)({
                data: signedData,
                signature: signature
            });
            if (createdBy !== (0, _ethereumjsutil.toChecksumAddress)(pk)) return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
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
                if (createdBy !== (0, _ethereumjsutil.toChecksumAddress)(decoded.publicKey)) return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
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
                console.log(decoded);
                if (role !== decoded.role || createdBy !== (0, _ethereumjsutil.toChecksumAddress)(decoded.publicKey)) return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
                next();
            });
        } catch (err) {
            return res.status(401).send(_types.ResponseMessage.UnAuthorizedAction);
        }
    };
