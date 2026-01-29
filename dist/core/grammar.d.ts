export declare class Grammar {
    /**
     * SELECT
     */
    compileSelect(table: string, columns?: string[]): string;
    /**
     * INSERT
     */
    compileInsert(table: string, data: Record<string, unknown>): {
        sql: string;
        values: unknown[];
    };
    /**
     * UPDATE
     */
    compileUpdate(table: string, data: Record<string, unknown>, wheres: Array<{
        column: any;
        operator: string;
    }>): {
        sql: string;
        values: unknown[];
    };
    /**
     * DELETE
     */
    compileDelete(table: string, wheres: Array<{
        column: any;
        operator: string;
    }>): string;
}
