import 'reflect-metadata';
import express from 'express'
import { config } from "dotenv"
import { startServer } from './utils';

const app = express()
config(); // env files configuration
startServer(app);
