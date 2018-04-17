"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compression = require("compression");
const cors = require("cors");
const DataLoaderFactory_1 = require("./graphql/dataloaders/DataLoaderFactory");
const express = require("express");
const helmet = require("helmet");
const graphqlHTTP = require("express-graphql");
const models_1 = require("./models");
const extract_jwt_middleware_1 = require("./middlewares/extract-jwt.middleware");
const schema_1 = require("./graphql/schema");
const RequestedFields_1 = require("./graphql/ast/RequestedFields");
class App {
    constructor() {
        this.express = express();
        this.init();
    }
    init() {
        this.requestedFields = new RequestedFields_1.RequestedFields();
        this.dataLoaderFactory = new DataLoaderFactory_1.DataLoaderFactory(models_1.default, this.requestedFields);
        this.middleware();
    }
    middleware() {
        this.express.use(cors({
            origin: '*',
            methods: ['POST', 'GET'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Encoding'],
            preflightContinue: false,
            optionsSuccessStatus: 204
        }));
        this.express.use(compression());
        this.express.use(helmet());
        this.express.use('/graphql', extract_jwt_middleware_1.extractJwtMiddleware(), (req, res, next) => {
            req['context']['db'] = models_1.default;
            req['context']['dataloaders'] = this.dataLoaderFactory.getLoaders();
            req['context']['requestedFields'] = this.requestedFields;
            next();
        }, graphqlHTTP((req) => ({
            schema: schema_1.default,
            graphiql: process.env.NODE_ENV === 'development',
            context: req['context']
        })));
    }
}
exports.default = new App().express;
