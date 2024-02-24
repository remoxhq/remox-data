"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "errorHandler", {
    enumerable: true,
    get: function() {
        return errorHandler;
    }
});
const _models = require("../models");
const errorHandler = (err, req, res, next)=>{
    console.log("err");
    console.log(err);
    if (err instanceof _models.CustomError) {
        const { statusCode, message } = err;
        res.status(statusCode).send({
            message
        });
    } else {
        console.error(JSON.stringify(err, null, 2));
        res.status(500).send({
            errors: [
                {
                    message: "Internal server error"
                }
            ]
        });
    }
    next();
};
