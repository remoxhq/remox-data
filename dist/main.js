"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "mongoClient", {
    enumerable: true,
    get: function() {
        return mongoClient;
    }
});
const _express = /*#__PURE__*/ _interop_require_default(require("express"));
const _services = require("./services");
const _dotenv = require("dotenv" //* Express App
);
const _mongodb = require("mongodb");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const app = (0, _express.default)();
(0, _dotenv.config)();
const port = process.env.PORT || 8080;
const mongoDbUri = process.env.MONGODB_URI || "";
const mongoClient = new _mongodb.MongoClient(mongoDbUri);
app.route('/fetch/balance').get(async (req, res)=>{
    const name = req.query.name;
    const db = mongoClient.db(process.env.DB_NAME);
    const collection = db.collection("OrganizationsHistoricalBalances");
    const response = await collection.findOne({
        name
    });
    res.json(response);
});
app.route('/refresh/balance').get(async (req, res)=>{
    await (0, _services.balanceRefresher)();
    res.status(200).send("Balance refreshed!");
});
app.route('/orgs/balance/portfolio').get(async (req, res)=>{
    const mappedBalanceOfAllDaos = await (0, _services.fetchAndStoreAnnualBalance)();
    res.json(mappedBalanceOfAllDaos);
});
app.route('/orgs/active').get(async (req, res)=>{
    const list = await (0, _services.fetchOrgs)();
    list ? res.status(200).send("Organizations imported!") : res.status(404).send('No organizations found!');
});
app.use(async (req, res, next)=>{
    await mongoClient.connect();
    console.log("Connected to MongoDB");
    next();
});
app.listen(port, async ()=>{
    console.log(`Ready: http://localhost:${port}`);
});
