import { NextFunction, Request, Response } from "express"
import { getContainer } from "../../utils";
import IAuthService from "../../services/auth/IAuthService";
import { Roles, TYPES } from "../../utils/types";
import { ObjectId } from "mongodb";
import { AppRequest } from "../../models";

export interface OrganizationFilterRequest extends AppRequest {
    aggregationPipeline?: Array<any>;
}

export const addOrganizationFilter = () =>
    async (req: OrganizationFilterRequest, res: Response, next: NextFunction) => {
        try {
            const diContainer = getContainer();
            const usrPulicKey = req.headers.address;
            const pageIndex = parseInt(req.query.pageIndex as string, 10) || 0;
            const pageSize = parseInt(req.query.pageSize as string, 10) || Number.MAX_SAFE_INTEGER;

            const aggregationPipeline: any[] = [];
            let match: any = {};
            const field: any = {};

            if (req.query.chain)
                match[`networks.${req.query.chain as string}`] = { $exists: true };

            if (req.query.searchParam)
                match.name = { $regex: req.query.searchParam as string, $options: 'i' };

            if (req.query.mine)
                match.createdBy = usrPulicKey;
            else if (req.user && req.user?.role !== Roles.SuperAdmin) match.isPrivate = false

            if (usrPulicKey) {
                const authService = diContainer.get<IAuthService>(TYPES.IAuthService);
                const user = await authService.getUserByPublicKey(req, res)
                field[`isFavorited`] = {
                    $in: ['$_id', Object.keys(user.favoriteOrganizations).map((id) => new ObjectId(id))],
                }
            } else field[`isFavorited`] = false

            if (req.query.favOnly)
                match.isFavorited = true;

            match.isDeleted = false;
            aggregationPipeline.push({ $addFields: field });
            aggregationPipeline.push({ $match: match });
            aggregationPipeline.push({
                $facet: {
                    totalRecords: [
                        { $count: "total" }
                    ],
                    data:
                        [
                            { $sort: { balance: -1 } },
                            { $skip: pageIndex },
                            { $limit: pageSize }
                        ]
                }
            });

            req.aggregationPipeline = aggregationPipeline
            next();
        } catch (err) {
            next(err);
        }
    }
