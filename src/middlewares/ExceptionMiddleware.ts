import { NextFunction, Request, Response } from "express";
import { CustomError } from "../models";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log("err");
    console.log(err);

    if (err instanceof CustomError) {
        const { statusCode, message } = err;
        res.status(statusCode).send({ message });
    }
    else {
        console.error(JSON.stringify(err, null, 2));
        res.status(500).send({ errors: [{ message: "Internal server error" }] });
    }
    next()
};