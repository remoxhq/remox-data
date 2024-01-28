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
const validateBody = (schema)=>(req, res, next)=>{
        try {
            const { error } = schema.validate(req.body);
            if (error) return res.status(422).json({
                error: error.details.map((x)=>x.message.replace(/"/g, ""))
            });
            next();
        } catch (err) {
            next(err);
        }
    };
