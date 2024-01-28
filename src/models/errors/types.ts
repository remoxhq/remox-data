export enum ExceptionType {
    BadRequest = 400,
    UnAuthenticated = 401,
    UnAuthorized = 403,
    NotFound = 404
}

export class CustomError {
    public readonly statusCode: number;
    public readonly message: string;

    constructor(message: string, type: ExceptionType) {
        this.statusCode = type;
        this.message = message;
    }
}