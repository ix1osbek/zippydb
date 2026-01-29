export interface IDriver {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    execute<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
}
