import { Request, Response } from "express";
import { injectable } from "inversify";
import { config } from "dotenv";
import IAuthService from "./IAuthService";
import { Db } from "mongodb";
import { ResponseMessage, Roles } from "../../utils/types";
import Jwt from "jsonwebtoken";
config();

const usersCollection = "Users"

@injectable()
class AuthManager implements IAuthService {

    async signIn(req: Request, res: Response): Promise<Response> {
        const publicKey = req.headers.address;
        if (!publicKey) return res.status(404).send(ResponseMessage.OrganizationNotFound);

        const db = req.app.locals.db as Db;
        const collection = db.collection(usersCollection);
        let existingUser = await collection.findOne({ publicKey });

        if (!existingUser) {
            const newUser: Omit<any, '_id'> = {
                publicKey,
                role: Roles.User,
                favoriteOrgs: []
            };
            const createdUser = await collection.insertOne(newUser);
            if (!createdUser.insertedId) return res.status(500).send(ResponseMessage.UnknownServerError)

            existingUser = {
                ...newUser,
                _id: createdUser.insertedId
            };
        };

        const jwtToken = Jwt.sign({ role: existingUser.role, publicKey }, process.env.AUTH_SECRET_KEY!)

        return res.status(200).send(jwtToken)
    }

    async udpateRole(req: Request, res: Response): Promise<Response> {
        const publicKey = req.body.to;
        
        const newRole = req.body.role;
        if (!publicKey) return res.status(404).send(ResponseMessage.OrganizationNotFound);

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

        return res.status(404).json(ResponseMessage.OrganizationNotFound);
    }
}

export default AuthManager;