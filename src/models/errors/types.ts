export enum ExceptionType {
    BadRequest = 400,
    UnAuthenticated = 401,
    UnAuthorized = 403,
    NotFound = 404,
    ServerError = 500
}

export class CustomError extends Error {
    public readonly statusCode: number;
    public readonly message: string;

    constructor(message: string, type: ExceptionType) {
        super();
        this.statusCode = type;
        this.message = message;
    }
}