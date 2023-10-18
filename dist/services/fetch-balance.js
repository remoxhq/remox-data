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
        const collection = db.collection("OrganizationsHistoricalBalances");
        const mappedBalanceOfAllDaos = await Promise.all(Object.keys(_firebasedb.daos).map(async (daoName)=>{
            if (!_firebasedb.daos[daoName]) return;
            let historicalTreasury = {};
            let walletAddresses = [];
            await (0, _rootparser.rootParser)(_firebasedb.daos[daoName], historicalTreasury, walletAddresses);
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
        return mappedBalanceOfAllDaos;
    } catch (error) {
        throw new Error(error);
    }
};
