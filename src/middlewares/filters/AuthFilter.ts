import { NextFunction, Request, Response } from "express"
import { recoverPersonalSignature } from "@metamask/eth-sig-util"
import { toChecksumAddress } from "ethereumjs-util"
import { ResponseMessage } from "../../utils/types";
import Jwt from "jsonwebtoken";

export const checkUserSignature = () =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let signature = req.headers.signature?.toString();
            let signedData = req.headers.signeddata?.toString();
            let createdBy = req.headers.address;
            if (!signature || !signedData) return res.status(401).send(ResponseMessage.UnAuthorizedAction)

            const pk = recoverPersonalSignature({ data: signedData, signature: signature })
            if (createdBy !== toChecksumAddress(pk)) return res.status(401).send(ResponseMessage.UnAuthorizedAction)

            next()
        } catch (err) {
            return res.status(401).send(ResponseMessage.UnAuthorizedAction)
        }
    }

export const checkUserJwt = () =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization?.toString();
            const createdBy = req.headers.address;
            if (!token) return res.status(401).send(ResponseMessage.UnAuthorizedAction)

            Jwt.verify(token.split(" ")[1], process.env.AUTH_SECRET_KEY!, (err, decoded: any) => {
                if (err || !decoded)
                    return res.status(401).json(ResponseMessage.UnAuthorizedAction);

                if (createdBy !== toChecksumAddress(decoded.publicKey)) return res.status(401).send(ResponseMessage.UnAuthorizedAction)

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

                    console.log(decoded);
                    
                if (role !== decoded.role || createdBy !== toChecksumAddress(decoded.publicKey))
                    return res.status(401).send(ResponseMessage.UnAuthorizedAction)

                next();
            });
        } catch (err) {
            return res.status(401).send(ResponseMessage.UnAuthorizedAction)
        }
    }
