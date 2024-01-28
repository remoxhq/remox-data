import { NextFunction, Request, Response } from "express"
import { ObjectSchema } from "joi"

export const validateBody = (schema: ObjectSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error } = schema.validate(req.body);
            if (error)
                return res.status(422).json({ error: error.details.map(x => x.message.replace(/"/g, "")) });

            next();
        } catch (err) {
            next(err);
        }
    }

