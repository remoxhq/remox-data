import { AppResponse } from "../../models";
import { Response } from "express";

export function handleError(res: Response, error: any): Response {
    const { statusCode, message } = error;
    return res.status(statusCode || 500).send(new AppResponse(statusCode || 500, false, message || 'Internal Server Error'));
}