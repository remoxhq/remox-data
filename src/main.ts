import 'reflect-metadata';
import express, { Response, Request } from 'express'
import { config } from "dotenv"
import { startServer } from './utils';
const app = express()

config();
startServer(app);
