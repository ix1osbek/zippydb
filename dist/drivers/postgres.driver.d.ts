import { IDriver } from "../interfaces/driver.interface";
export declare class PostgresDriver implements IDriver {
    private pool;
    constructor(config: any);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    execute(sql: string, params?: any[]): Promise<any[]>;
}
