"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _dotenv = require("dotenv" //* Express App
);
const _firebasedb = require("./firebase-db");
const _firestore = require("firebase/firestore");
const _fs = /*#__PURE__*/ _interop_require_wildcard(require("fs"));
const _clientsdk = require("@covalenthq/client-sdk");
const _mongodb = require("mongodb");
const _covalent = require("./covalent");
const _dateandtime = /*#__PURE__*/ _interop_require_default(require("date-and-time"));
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {
        __proto__: null
    };
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const app = (0, _express.default)();
(0, _dotenv.config)();
const port = process.env.PORT || 8080;
const mongoDbUri = process.env.MONGODB_URI || "";
const covalentApiKey = process.env.COVALENT_API_KEY || "";
app.route('/orgs/balance/portfolio').get(async (req, res)=>{
    const covalentClient = new _clientsdk.CovalentClient(covalentApiKey);
    const mongoClient = new _mongodb.MongoClient(mongoDbUri);
    await mongoClient.connect();
    const db = mongoClient.db(process.env.DB_NAME);
    const mappedBalanceOfAllDaos = await Promise.all(Object.keys(_firebasedb.daos).map(async (daoName)=>{
        if (!_firebasedb.daos[daoName]) return;
        let totalsByDate = {};
        const mappedProtfolioBalanceData = await Promise.all(_firebasedb.daos[daoName].addresses.map(async (address)=>{
            const walletAnnualPortfolioBlance = await covalentClient.BalanceService.getHistoricalPortfolioForWalletAddress(_firebasedb.daos[daoName].network, address, {
                quoteCurrency: 'USD',
                days: 365
            });
            walletAnnualPortfolioBlance.data.items.map((token)=>{
                token.holdings.forEach((holding, index)=>{
                    if (!holding.close.pretty_quote || index === 0) return; // skip if there's no pretty_quote value
                    //split date and parse amount
                    const date = holding.timestamp.toISOString().split("T")[0];
                    const originAmount = holding.close?.quote ?? 0;
                    const amount = originAmount < 0 ? 0 : originAmount;
                    // const amount =holding.close?.quote ?? 0
                    if (!totalsByDate[date]) totalsByDate[date] = 0;
                    totalsByDate[date] += amount;
                });
            });
            totalsByDate = Object.entries(totalsByDate).sort(([key1], [key2])=>new Date(key1).getTime() > new Date(key2).getTime() ? 1 : -1).reduce((a, c)=>{
                a[c[0]] = c[1];
                return a;
            }, {});
            // filter by date
            let responseObj = {
                week: Object.entries(totalsByDate).length ? Object.entries(totalsByDate).filter(([time, amount])=>Math.abs(_dateandtime.default.subtract(new Date(), new Date(time)).toDays()) <= 7).reduce((a, c)=>{
                    a[c[0]] = c[1];
                    return a;
                }, {}) : {},
                month: Object.entries(totalsByDate).length ? Object.entries(totalsByDate).filter(([time, amount])=>Math.abs(_dateandtime.default.subtract(new Date(), new Date(time)).toDays()) <= 31).reduce((a, c)=>{
                    a[c[0]] = c[1];
                    return a;
                }, {}) : {},
                quart: Object.entries(totalsByDate).length ? Object.entries(totalsByDate).filter(([time, amount])=>Math.abs(_dateandtime.default.subtract(new Date(), new Date(time)).toDays()) <= 90).reduce((a, c)=>{
                    a[c[0]] = c[1];
                    return a;
                }, {}) : {},
                year: Object.entries(totalsByDate).length ? Object.entries(totalsByDate).filter(([time, amount])=>Math.abs(_dateandtime.default.subtract(new Date(), new Date(time)).toDays()) <= 365).reduce((a, c)=>{
                    a[c[0]] = c[1];
                    return a;
                }, {}) : {}
            };
            return responseObj;
        }));
        return {
            [daoName]: mappedProtfolioBalanceData
        };
    }));
    res.json(mappedBalanceOfAllDaos);
});
app.route('/orgs/active').get(async (req, res)=>{
    const organizationCollection = 'organizations';
    const accountCollection = 'accounts';
    const querySnapshot = await (0, _firestore.getDocs)((0, _firestore.collection)(_firebasedb.db, organizationCollection));
    const list = {};
    await Promise.all(querySnapshot.docs.map(async (document)=>{
        const orgData = document.data();
        await Promise.all(Array.from(orgData.accounts).map(async (item)=>{
            const docRef = (0, _firestore.doc)(_firebasedb.db, accountCollection, item.id);
            const docSnap = await (0, _firestore.getDoc)(docRef);
            const accountData = docSnap.data();
            if (!list[orgData.name]) list[orgData.name] = {
                network: _covalent.covalentNetworks[accountData.blockchain],
                addresses: [
                    accountData.address
                ]
            };
            else list[orgData.name] = {
                network: _covalent.covalentNetworks[accountData.blockchain],
                addresses: [
                    ...list[orgData.name].addresses,
                    accountData.address
                ]
            };
        }));
    }));
    if (!list) res.json({
        error: 'No organizations found'
    });
    const jsonString = JSON.stringify(list, null, 2);
    const filePath = './orgs.json';
    _fs.writeFileSync(filePath, jsonString, 'utf-8');
    res.json(list);
});
app.listen(port, ()=>{
    console.log(`Ready: http://localhost:${port}`);
});
