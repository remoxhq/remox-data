"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "fetchAndStoreAnnualBalance", {
    enumerable: true,
    get: function() {
        return fetchAndStoreAnnualBalance;
    }
});
const _mongodb = require("mongodb");
const _dotenv = require("dotenv");
const _rootparser = require("./root-parser");
const _firebasedb = require("../firebase-db");
const _dateandtime = /*#__PURE__*/ _interop_require_default(require("date-and-time"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
(0, _dotenv.config)();
const fetchAndStoreAnnualBalance = async ()=>{
    try {
        const mongoDbUri = process.env.MONGODB_URI || "";
        const mongoClient = new _mongodb.MongoClient(mongoDbUri);
        await mongoClient.connect();
        const db = mongoClient.db(process.env.DB_NAME);
        const storedOrgsMap = new Map();
        const collection = db.collection("OrganizationsHistoricalBalances");
        const query = {
            name: {
                $in: Object.keys(_firebasedb.daos)
            }
        };
        const projection = {
            _id: 0,
            name: 1
        };
        const storedOrgs = await collection.find(query, {
            projection
        }).toArray();
        storedOrgs.forEach((item, index)=>{
            storedOrgsMap.set(item.name, item.name);
        });
        console.log(await collection.countDocuments());
        await Promise.all(Object.keys(_firebasedb.daos).map(async (daoName, index)=>{
            if (!_firebasedb.daos[daoName] || storedOrgsMap.get(daoName)) return;
            let historicalTreasury = {};
            let walletAddresses = [];
            await (0, _rootparser.rootParser)(_firebasedb.daos[daoName], historicalTreasury, walletAddresses, daoName);
            historicalTreasury = Object.entries(historicalTreasury).sort(([key1], [key2])=>new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce((a, c)=>{
                a[c[0]] = c[1];
                return a;
            }, {});
            let responseObj = {
                name: daoName,
                addresses: walletAddresses,
                annual: Object.entries(historicalTreasury).length ? Object.entries(historicalTreasury).filter(([time, amount])=>Math.abs(_dateandtime.default.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce((a, c)=>{
                    a[c[0]] = c[1];
                    return a;
                }, {}) : {}
            };
            await collection.insertOne(responseObj);
            return {
                [daoName]: responseObj
            };
        }));
        return {};
    } catch (error) {
        throw new Error(error);
    }
};
