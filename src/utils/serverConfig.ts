import { MongoClient } from "mongodb";
import { config } from "dotenv";
import cors from "cors";
import configureRouter from "./loadRoutes";
import { errorHandler } from "../middlewares";
import bodyParser from "body-parser";
import multer from "multer";
import { Server } from "socket.io"
import { NextFunction, Request, Response } from "express";
config();

export async function startServer(app: any) {
    try {
        const mongoDbUri = process.env.MONGODB_URI || ""
        const port = process.env.PORT || 8080
        const client = new MongoClient(mongoDbUri)
        await client.connect();
        app.locals.db = client.db(process.env.DB_NAME);

        loadMiddlewares(app)
        configureRouter(app);// loads controler;

        const server = app.listen(port, () => {
            console.log('Server is running on port 3000');
        });

        configureWSS(app, server);
        app.use(errorHandler);

        // Close the MongoDB connection when the server is shutting down
        process.on('SIGINT', async () => {
            closeMongoConnection(client);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

function loadMiddlewares(app: any) {
    app.use(multer().any())
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin!);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        next();
    });
}

function configureWSS(app: any, server: any) {
    const io = new Server(server, {
        cors: {
            origin: "https://remox.io/",
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