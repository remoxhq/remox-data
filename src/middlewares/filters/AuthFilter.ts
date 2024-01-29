import { NextFunction, Request, Response } from "express"
import { recoverPersonalSignature } from "@metamask/eth-sig-util"
import { toChecksumAddress } from "ethereumjs-util"
import { ResponseMessage } from "../../utils/types";

export const checkUserSignature = () =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            let signature = req.headers.signature?.toString();
            let signedData = req.headers.signeddata?.toString();
            let createdBy = req.body.createdBy;
            if (!signature || !signedData) return res.status(401).send(ResponseMessage.UnAuthorizedAction)

            const pk = recoverPersonalSignature({ data: signedData, signature: signature })
            if (createdBy !== toChecksumAddress(pk)) return res.status(401).send(ResponseMessage.UnAuthorizedAction)

            next()
        } catch (err) {
            return res.status(401).send(ResponseMessage.UnAuthorizedAction)
        }
    }
