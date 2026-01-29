import { Pool } from "pg";
import { IDriver } from "../interfaces/driver.interface";

export class PostgresDriver implements IDriver {
  private pool: Pool;

  constructor(config: any) {
    this.pool = new Pool(config);
  }

  async connect() {
    await this.pool.connect();
  }
  async disconnect() {
    await this.pool.end();
  }

  async execute(sql: string, params?: any[]) {
    const result = await this.pool.query(sql, params);
    return result.rows;
  }
}
