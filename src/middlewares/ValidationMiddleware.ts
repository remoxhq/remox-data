import { NextFunction, Request, Response } from "express"
import { ObjectSchema } from "joi"
import { parseFormData } from "../utils";

export const validateBody = (schema: ObjectSchema, fieldArrayPrefix: string) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsedBody = parseFormData(fieldArrayPrefix, req);
            const { error } = schema.validate(parsedBody);
            if (error)
                return res.status(422).json({
                    error: {
                        messages: error.details.map(x => x.message.replace(/"/g, "")),
                        statusCode: 422
                    }
                });
            next();
        } catch (err) {
            next(err);
        }
    }

