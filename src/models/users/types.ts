import { ObjectId } from "mongodb"

export interface User {
    _id?: ObjectId
    publicKey: string
    role: string,
    favoriteOrganizations: Map<string, boolean>,
};