import { MongoClient } from "mongodb";
import { config } from "dotenv";
import cors from "cors";
import configureRouter from "./loadRoutes";
import { errorHandler } from "../middlewares";
import bodyParser from "body-parser";
config();

export async function startServer(app: any) {
    try {
        const mongoDbUri = process.env.MONGODB_URI || ""
        const port = process.env.PORT || 8080
        const client = new MongoClient(mongoDbUri)
        await client.connect();
        app.locals.db = client.db(process.env.DB_NAME);

        loadMiddlewares(app)
        configureRouter(app); // loads controlers

        app.listen(port, () => {
            console.log('Server is running on port 3000');
        });

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
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());
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