"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "startServer", {
    enumerable: true,
    get: function() {
        return startServer;
    }
});
const _mongodb = require("mongodb");
const _dotenv = require("dotenv");
const _cors = /*#__PURE__*/ _interop_require_default(require("cors"));
const _loadRoutes = /*#__PURE__*/ _interop_require_default(require("./loadRoutes"));
const _middlewares = require("../middlewares");
const _bodyparser = /*#__PURE__*/ _interop_require_default(require("body-parser"));
const _multer = /*#__PURE__*/ _interop_require_default(require("multer"));
const _socketio = require("socket.io");
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
(0, _dotenv.config)();
async function startServer(app) {
    try {
        const mongoDbUri = process.env.MONGODB_URI || "";
        const port = process.env.PORT || 8080;
        const client = new _mongodb.MongoClient(mongoDbUri);
        await client.connect();
        app.locals.db = client.db(process.env.DB_NAME);
        loadMiddlewares(app);
        (0, _loadRoutes.default)(app); // loads controler;
        const server = app.listen(port, ()=>{
            console.log('Server is running on port 3000');
        });
        configureWSS(app, server);
        app.use(_middlewares.errorHandler);
        // Close the MongoDB connection when the server is shutting down
        process.on('SIGINT', async ()=>{
            closeMongoConnection(client);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}
function loadMiddlewares(app) {
    app.use((0, _multer.default)().any());
    app.use(_bodyparser.default.urlencoded({
        extended: true
    }));
    app.use(_bodyparser.default.json());
    app.use((0, _cors.default)());
}
function configureWSS(app, server) {
    const io = new _socketio.Server(server, {
        cors: {
            origin: "http://localhost:3000",
            methods: [
                "GET",
                "POST"
            ]
        }
    });
    app.locals.io = io;
    io.on('connection', (socket)=>{
        console.log('Client connected');
        // Example: Disconnect event
        socket.on('disconnect', ()=>{
            console.log('Client disconnected');
        });
    });
}
async function closeMongoConnection(client) {
    try {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
}
