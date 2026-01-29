"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresDriver = void 0;
const pg_1 = require("pg");
class PostgresDriver {
    constructor(config) {
        this.pool = new pg_1.Pool(config);
    }
    async connect() {
        await this.pool.connect();
    }
    async disconnect() {
        await this.pool.end();
    }
    async execute(sql, params) {
        const result = await this.pool.query(sql, params);
        return result.rows;
    }
}
exports.PostgresDriver = PostgresDriver;
