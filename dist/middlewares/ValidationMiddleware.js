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
const validateBody = (schema, field)=>async (req, res, next)=>{
        try {
            let parserdBody = (0, _utils.parseFormData)(req.body, field ?? "");
            if (req.files) parserdBody['image'] = req.files[0];
            const { error } = schema.validate(parserdBody);
            if (error) return res.status(422).json({
                error: error.details.map((x)=>x.message.replace(/"/g, ""))
            });
            next();
        } catch (err) {
            next(err);
        }
    };
