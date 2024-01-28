import { NextFunction, Request, Response } from "express";
import { CustomError } from "../models";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CustomError) {
        const { statusCode, message } = err;
        return res.status(statusCode).send({ message });
    }

    // Unhandled errors
    console.error(JSON.stringify(err, null, 2));
    return res.status(500).send({ errors: [{ message: "Internal server error" }] });
};