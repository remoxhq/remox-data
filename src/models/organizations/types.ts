import { File } from "buffer";
import Joi from "joi";
import { ObjectId } from "mongodb";

export interface Organization {
    _id: ObjectId,
    name: string
    image: File,
    dashboardLink: string
    website: string,
    github: string,
    discord: string,
    twitter: string,
    isPrivate: boolean,
    isVerified: boolean,
    createdBy: string,
    createdDate: string,
    updatedDate: string,
    isDeleted: boolean,
    isActive: boolean,
    governanceSlug: string,
    accounts: Account[]
};

export interface Account {
    name: string
    address: string,
    chain: string
};

const accountSchema = Joi.object<Account>({
    name: Joi.string()
        .regex(/^[a-zA-Z0-9]+$/)
        .min(3)
        .max(10)
        .required()
        .label("Account name"),

    address: Joi.string()
        .regex(/^[a-zA-Z0-9]+$/)
        .max(42)
        .required()
        .label("Account address"),

    chain: Joi.string()
        .min(1)
        .required()
        .label("Account chain")
});

export const organizationShcema = Joi.object<Organization>({
    name: Joi.string()
        .min(3)
        .max(40)
        .regex(/^(?:[a-zA-Z0-9-_.]|['"](?=[a-zA-Z0-9-_.]+['"]))+$/)
        .required()
        .label("Organization name"),

    image: Joi.optional()
        .meta({ accept: 'image/*' })
        .custom((value, helpers) => {
            if (value && !["image/jpeg", "image/png", "image/svg+xml", "image/webp"].some((x) => x === value.mimetype)) {
                return helpers.error('File must be an image/jpeg, image/png, image/svg+xml');
            }
            return value;
        })
        .label("Organization image"),

    dashboardLink: Joi.string()
        .min(3)
        .regex(/^[a-z0-9]+$/)
        .required()
        .label("Organization dashboard link"),

    website: Joi.optional()
        .label("Organization website url"),

    github: Joi.optional()
        .label("Organization github url"),

    discord: Joi.optional()
        .label("Organization discord url"),

    twitter: Joi.optional()
        .label("Organization twitter url"),

    createdBy: Joi.string()
        .label("Organization Creator wallet address"),

    governanceSlug: Joi.optional()
        .label("Governance slug"),

    isPrivate: Joi.boolean(),

    isDeleted: Joi.boolean(),

    isVerified: Joi.boolean(),

    createdDate: Joi.string(),

    updatedDate: Joi.string(),

    accounts: Joi.array().items(accountSchema).required(),
});


