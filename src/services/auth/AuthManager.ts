import { Request, Response } from "express";
import { injectable } from "inversify";
import { config } from "dotenv";
import IAuthService from "./IAuthService";
import { Db, ObjectId } from "mongodb";
import { ResponseMessage, Roles } from "../../utils/types";
import Jwt from "jsonwebtoken";
import { AppRequest, AppResponse, CustomError, ExceptionType, User } from "../../models";
import { handleError } from "../../utils/helpers/responseHandler";
config();

export const usersCollection = "Users"

@injectable()
class AuthManager implements IAuthService {

    async signIn(req: AppRequest, res: Response): Promise<Response> {
        try {
            const publicKey = req.user.publicKey;
            const db = req.app.locals.db as Db;
            const collection = db.collection<User>(usersCollection);
            let existingUser = await collection.findOne({ publicKey });

            if (!existingUser) {
                const newUser: User = {
                    publicKey: publicKey as string,
                    role: Roles.User,
                    favoriteOrganizations: new Map<string, boolean>(),
                };

                const createdUser = await collection.insertOne(newUser);
                if (!createdUser.insertedId)
                    throw new CustomError(ResponseMessage.UnknownServerError, ExceptionType.ServerError);

                existingUser = {
                    ...newUser,
                    _id: createdUser.insertedId
                };
            };

            const jwtToken = Jwt.sign({ role: existingUser.role, publicKey }, process.env.AUTH_SECRET_KEY!)

            return res.status(200).send(new AppResponse(200, true, undefined, jwtToken));
        } catch (error) {
            return handleError(res, error)
        }
    }

    async udpateRole(req: Request, res: Response): Promise<Response> {
        const publicKey = req.body.to;
        const newRole = req.body.role;

        const db = req.app.locals.db as Db;
        const collection = db.collection(usersCollection);
        const result = await collection.updateOne(
            { publicKey },
            {
                $set: {
                    role: newRole
                }
            }
        );

        if (result.acknowledged)
            return res.json({ message: ResponseMessage.OrganizationUpdated });

        return res.status(404).json(ResponseMessage.UserNotFound);
    }

    async getUserByPublicKey(req: Request, res: Response): Promise<User> {
        const publicKey = req.headers.address;
        if (!publicKey) throw new CustomError(ResponseMessage.UserNotFound, ExceptionType.NotFound);

        const db = req.app.locals.db as Db;
        const users = db.collection<User>(usersCollection);
        let user = await users.findOne({ publicKey });
        if (!user) throw new CustomError(ResponseMessage.UserNotFound, ExceptionType.NotFound);

        return user;
    }

    async getUserByPublicKeyWithOrgs(req: Request, res: Response): Promise<Response> {
        const publicKey = req.headers.address;
        if (!publicKey) return res.status(422).json({ message: ResponseMessage.UserPublicKeyRequired });
        console.log(req.filter);

        const db = req.app.locals.db as Db;
        const users = db.collection(usersCollection);
        const result = await users.aggregate([
            { $match: { publicKey } },
            {
                $lookup: {
                    from: 'Organizations',
                    localField: 'favoriteOrgs',
                    foreignField: '_id',
                    as: 'favOrgs'
                }
            },
            {
                $project: {
                    favoriteOrgs: 0
                }
            },
            { $unwind: { path: '$favOrgs', preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: '$_id',
                    user: { $mergeObjects: '$$ROOT' },
                    favOrgs: { $push: '$favOrgs' }
                }
            },
            {
                $match: req.filter
            },
            {
                $project: {
                    "user.favOrgs": 0
                }
            },
        ]).toArray();

        return res.status(200).send(result)
    }
}

export default AuthManager;