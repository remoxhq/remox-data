import { NextFunction, Request, Response } from "express"
import { toChecksumAddress } from "ethereumjs-util"
import { ResponseMessage } from "../../utils/types";
import Jwt, { JwtPayload } from "jsonwebtoken";
import { AppRequest } from "../../models";

export const checkUserSignature = () =>
    async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            let accessKey = req.headers.accesskey?.toString();
            if (!accessKey) return res.status(401).send(ResponseMessage.UnAuthorizedAction)
            const decoded = Jwt.verify(accessKey, process.env.AUTH_SECRET_KEY!) as JwtPayload

            req.user = {
                publicKey: decoded.address
            };

            next()
        } catch (err) {
            return res.status(401).send(ResponseMessage.UnAuthorizedAction)
        }
    }

export const checkUserJwt = () =>
    async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.toString();
            const createdBy = req.headers.address as string;

            if (!token) return res.status(401).send(ResponseMessage.UnAuthorizedAction)

            Jwt.verify(token.split(" ")[1], process.env.AUTH_SECRET_KEY!, (err, decoded: any) => {
                if (err || !decoded)
                    return res.status(401).json(ResponseMessage.UnAuthorizedAction);

                if (toChecksumAddress(createdBy) !== toChecksumAddress(decoded.publicKey))
                    return res.status(401).send(ResponseMessage.UnAuthorizedAction)

                req.user = { role: decoded.role, publicKey: decoded.publicKey };
                next();
            });
        } catch (err) {
            return res.status(401).send(ResponseMessage.UnAuthorizedAction)
        }
    }

export const checkUserPermission = (role: string) =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.toString();
            const createdBy = req.headers.address;
            if (!token) return res.status(401).send(ResponseMessage.UnAuthorizedAction)

            Jwt.verify(token.split(" ")[1], process.env.AUTH_SECRET_KEY!, (err, decoded: any) => {
                if (err || !decoded)
                    return res.status(401).json(ResponseMessage.UnAuthorizedAction);

                if (role !== decoded.role || createdBy !== toChecksumAddress(decoded.publicKey))
                    return res.status(401).send(ResponseMessage.UnAuthorizedAction)

                next();
            });
        } catch (err) {
            return res.status(401).send(ResponseMessage.UnAuthorizedAction)
        }
    }

export const authenticateUserOrAllowAnonymous = () =>
    async (req: AppRequest, res: Response, next: NextFunction) => {
        try {
            const createdBy = req.headers.address;
            if (createdBy) await checkUserJwt()(req, res, next);
            else next()
        } catch (err) {
            return res.status(401).send(ResponseMessage.UnAuthorizedAction)
        }
    }
