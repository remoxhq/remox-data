"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "validateBody", {
    enumerable: true,
    get: function() {
        return validateBody;
    }
});
const _utils = require("../utils");
const validateBody = (schema, fieldArrayPrefix)=>async (req, res, next)=>{
        try {
            const parsedBody = (0, _utils.parseFormData)(fieldArrayPrefix, req);
            const { error } = schema.validate(parsedBody);
            if (error) return res.status(422).json({
                error: {
                    messages: error.details.map((x)=>x.message.replace(/"/g, "")),
                    statusCode: 422
                }
            });
            next();
        } catch (err) {
            next(err);
        }
    };
