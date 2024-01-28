import Joi, { ValidationErrorFunction } from "joi";

export interface Organization {
    name: number
};

export const organizationShcema = Joi.object<Organization>({
    name: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .label("Organization name"),
});
