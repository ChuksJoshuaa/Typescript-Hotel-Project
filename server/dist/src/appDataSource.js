"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSource = void 0;
const typeorm_1 = require("typeorm");
require("dotenv-safe/config");
const path_1 = __importDefault(require("path"));
const constant_1 = require("./constant");
const Hotel_1 = require("./entities/Hotel");
const HotelBrand_1 = require("./entities/HotelBrand");
const User_1 = require("./entities/User");
const portNumber = Number(process.env.DATABASE_PORT);
exports.dataSource = new typeorm_1.DataSource({
    type: "mongodb",
    host: process.env.MONGO_URI,
    url: process.env.MONGO_URI,
    port: portNumber,
    useNewUrlParser: !constant_1.__prod__,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    logging: true,
    migrations: [path_1.default.join(__dirname, "./migrations/*")],
    entities: [Hotel_1.Hotel, User_1.User, HotelBrand_1.HotelBrand],
});
//# sourceMappingURL=appDataSource.js.map