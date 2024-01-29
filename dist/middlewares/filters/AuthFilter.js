"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "checkUserSignature", {
    enumerable: true,
    get: function() {
        return checkUserSignature;
    }
});
const _ethsigutil = require("@metamask/eth-sig-util");
const _ethereumjsutil = require("ethereumjs-util");
const _types = require("../../utils/types");
const checkUserSignature = ()=>async (req, res, next)=>{
        try {
            let signature = req.headers.signature?.toString();
            let signedData = req.headers.signeddata?.toString();
            let createdBy = req.body.createdBy;
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
