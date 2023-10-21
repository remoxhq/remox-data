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
const _axios = /*#__PURE__*/ _interop_require_default(require("axios"));
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
app.route('/fetch/borrowrates').get(async (req, res)=>{
    const lendingToken = "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9";
    // const lendingTokenEvents = await axios.get(`https://etherscan.io/address/${lendingToken}#events`)
    const lendingTokenEvents = await _axios.default.get(`https://api.covalenthq.com/v1/1/events/topics/0x804c9b842b2748a22bb64b345453a3de7ca54a6ca45ce00d415894979e22897a/?starting-block=12150179&ending-block=12150779&key=${process.env.COVALENT_API_KEY}&quote-currency=USD&key-query=topics&key-query-opts=topics-opr%3D%3D&sender-address=${lendingToken}&receiver-address=$}`);
    const brs = [];
    Array.from(lendingTokenEvents.data.data.items).map((item)=>{
        if (Array.from(item.raw_log_topics).some((topic)=>topic === "0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48")) {
            Array.from(item.decoded.params).map((log)=>{
                if (log.name === 'variableBorrowRate') {
                    const br = parseFloat(log.value) / Math.pow(10, 27);
                    brs.push(br.toString());
                }
            });
        }
    });
    res.json(brs);
});
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
