import { MongoClient } from "mongodb";
import { config } from "dotenv";
import cors from "cors";
import configureRouter from "./loadRoutes";
import bodyParser from "body-parser";
import multer from "multer";
import { Server } from "socket.io"
config();

export async function startServer(app: any) {
    try {
        const mongoDbUri = process.env.MONGODB_URI || ""
        const port = process.env.APP_PORT
        const client = new MongoClient(mongoDbUri)
        await client.connect();
        app.locals.db = client.db(process.env.DB_NAME);
        loadMiddlewares(app)
        configureRouter(app);// loads controler;

        const server = app.listen(port, () => {
            console.log('Server is running on port' + process.env.APP_PORT);
        });

        configureWSS(app, server);

        process.on('SIGINT', async () => {
            closeMongoConnection(client);
        });
    } catch (error) {
        console.error('Error connecting to Server:', error);
    }
}

function loadMiddlewares(app: any) {
    app.use(multer().any())
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());
}

function configureWSS(app: any, server: any) {
    const io = new Server(server, {
        cors: {
            origin: process.env.COSR_ORIGINS,
            methods: ["GET", "POST"]
        }
    });
    
    app.locals.io = io;

    io.on('connection', (socket) => {
        console.log('Client connected');

        // Example: Disconnect event
        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
}

async function closeMongoConnection(client: MongoClient) {
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