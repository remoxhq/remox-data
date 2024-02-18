import { Request } from "express"

export * from "./errors/types"
export * from "./treasuries/types"
export * from "./organizations/types"
export * from "./pagination"
export * from "./users/types"

export interface AppRequest extends Request {
    user: {
        role:string
    }
}