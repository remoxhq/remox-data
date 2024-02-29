import { NextFunction, Request, Response } from "express"
import { toChecksumAddress } from "ethereumjs-util"
import { ResponseMessage } from "../../utils/types";
import Jwt, { JwtPayload } from "jsonwebtoken";
import { AppRequest, CustomError, ExceptionType } from "../../models";
import { handleError } from "../../utils/helpers/responseHandler";

export const checkUserSignature = () =>
    async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            let accessKey = req.headers.accesskey?.toString();
            if (!accessKey) throw new CustomError(ResponseMessage.UnAuthorizedAction, ExceptionType.UnAuthenticated)
            const decoded = Jwt.verify(accessKey, process.env.AUTH_SECRET_KEY!) as JwtPayload

            req.user = {
                publicKey: decoded.address
            };

            next()
        } catch (error) {
            return handleError(res, error)
        }
    }

export const checkUserJwt = () =>
    async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.toString();
            const createdBy = req.headers.address as string;

            if (!token) throw new CustomError(ResponseMessage.UnAuthorizedAction, ExceptionType.UnAuthenticated)

            Jwt.verify(token.split(" ")[1], process.env.AUTH_SECRET_KEY!, (err, decoded: any) => {
                if (err || !decoded)
                    throw new CustomError(ResponseMessage.UnAuthorizedAction, ExceptionType.UnAuthenticated)

                if (toChecksumAddress(createdBy) !== toChecksumAddress(decoded.publicKey))
                    throw new CustomError(ResponseMessage.UnAuthorizedAction, ExceptionType.UnAuthenticated)

                req.user = { role: decoded.role, publicKey: decoded.publicKey };
                next();
            });
        } catch (error) {
            return handleError(res, error)
        }
    }

export const checkUserPermission = (role: string) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.toString();
            const createdBy = req.headers.address;
            if (!token) throw new CustomError(ResponseMessage.UnAuthorizedAction, ExceptionType.UnAuthenticated)

            Jwt.verify(token.split(" ")[1], process.env.AUTH_SECRET_KEY!, (err, decoded: any) => {
                if (err || !decoded)
                    throw new CustomError(ResponseMessage.UnAuthorizedAction, ExceptionType.UnAuthenticated)

                if (role !== decoded.role || createdBy !== toChecksumAddress(decoded.publicKey))
                    throw new CustomError(ResponseMessage.UnAuthorizedAction, ExceptionType.UnAuthenticated)

                next();
            });
        } catch (error) {
            return handleError(res, error)
        }
    }

export const checkAccessKey = () =>
    async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const accessKey = req.headers.accesskey;
            if (!accessKey || accessKey !== process.env.API_ACCESS_KEY) throw new CustomError(ResponseMessage.ForbiddenRequest, ExceptionType.UnAuthorized)
            else next()
        } catch (error) {
            return handleError(res, error)
        }
    }

export const authenticateUserOrAllowAnonymous = () =>
    async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const createdBy = req.headers.address;
            if (createdBy) await checkUserJwt()(req, res, next);
            else next()
        } catch (error) {
            return handleError(res, error)
        }
    }
