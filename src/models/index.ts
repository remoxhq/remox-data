import { Request } from "express"

export * from "./errors/types"
export * from "./treasuries/types"
export * from "./organizations/types"
export * from "./pagination"
export * from "./users/types"

export interface AppRequest extends Request {
    user: {
        role?: string,
        publicKey: string
    },
    annual?: boolean,
}

export class AppResponse {
    statusCode: number;
    result?: any;
    success: boolean;
    error?: string | Error;

    constructor(statusCode: number, success: boolean, error?: string | Error, result?: any) {
        this.statusCode = statusCode;
        this.result = result;
        this.success = success;
        this.error = error;
    }
}