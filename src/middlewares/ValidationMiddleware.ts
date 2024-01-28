import { NextFunction, Request, Response } from "express"
import { ObjectSchema } from "joi"
import { parseFormData } from "../utils";

export const validateBody = (schema: ObjectSchema, field?: string) =>
    async <T>(req: Request, res: Response, next: NextFunction) => {
        try {
            let parserdBody = parseFormData<T>(req.body, field ?? "");

            if (req.files)
                parserdBody['image'] = req.files[0 as keyof {}];

            const { error } = schema.validate(parserdBody);
            if (error)
                return res.status(422).json({ error: error.details.map(x => x.message.replace(/"/g, "")) });

            next();
        } catch (err) {
            next(err);
        }
    }

