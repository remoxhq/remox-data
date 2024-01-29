import { NextFunction, Request, Response } from "express"

export const addOrganizationFilter = () =>
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const filter: any = {};
            if (req.query.chain) {
                const chain = req.query.chain as string;
                filter[`networks.${chain}`] = { $exists: true };
            }

            if (req.query.searchParam)
                filter.name = { $regex: req.query.searchParam as string, $options: 'i' };

            req.filter = filter
            next();
        } catch (err) {
            next(err);
        }
    }

