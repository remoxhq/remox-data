import { File } from "buffer";
import Joi from "joi";

export interface Organization {
    name: number
    image: File,
    dashboardLink: string
    website: string,
    github: string,
    discord: string,
    twitter: string,
    isPrivate: boolean,
    isVerified: boolean,
    accounts: Account[]
};

export interface Account {
    name: string
    address: string,
    chain: string
};

const accountSchema = Joi.object<Account>({
    name: Joi.string()
        .alphanum()
        .required()
        .label("Account name"),

    address: Joi.string()
        .alphanum()
        .required()
        .label("Account address"),

    chain: Joi.string()
        .alphanum()
        .required()
        .label("Account chain")
});

export const organizationShcema = Joi.object<Organization>({
    name: Joi.string()
        .alphanum()
        .min(3)
        .max(10)
        .required()
        .label("Organization name"),

    image: Joi.any()
        .meta({ accept: 'image/*' })
        .custom((value, helpers) => {
            if (value && !["image/jpeg", "image/png", "image/svg+xml"].some((x) => x === value.mimetype)) {
                return helpers.error('File must be an image/jpeg, image/png, image/svg+xml');
            }
            return value;
        })
        .required()
        .label("Organization image"),

    dashboardLink: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required()
        .label("Organization dashboard link"),

    website: Joi.string()
        .label("Organization website url"),

    github: Joi.string()
        .label("Organization github url"),

    discord: Joi.string()
        .label("Organization discord url"),

    twitter: Joi.string()
        .label("Organization twitter url"),

    isPrivate: Joi.string(),

    accounts: Joi.array().items(accountSchema).required(),
});


