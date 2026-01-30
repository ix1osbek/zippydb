import { IDriver } from "../interfaces/driver.interface";
import { Grammar } from "./grammar";
export declare class Builder<T extends Record<string, unknown> = Record<string, unknown>> {
    protected driver: IDriver;
    protected _table: string;
    protected _columns: string[];
    protected _wheres: Array<{
        column: keyof T;
        operator: string;
        value: unknown;
    }>;
    protected _orders: Array<{
        column: keyof T;
        direction: "asc" | "desc";
    }>;
    protected _limit: number | null;
    protected _offset: number | null;
    protected _distinct: boolean;
    protected _bindings: unknown[];
    protected grammar: Grammar;
    constructor(driver: IDriver);
    /**
     * Jadval nomini belgilash va yangi instance qaytarish
     */
    table<EntityType extends Record<string, unknown>>(name: string): Builder<EntityType>;
    /**
     * SELECT qilinadigan ustunlarni belgilash
     */
    select(...columns: (keyof T | "*")[]): this;
    /**
     * Dublikatlarni olib tashlash
     */
    distinct(): this;
    /**
     * WHERE sharti
     */
    where(column: keyof T, operator: string, value: T[keyof T] | unknown): this;
    /**
     * Tartiblash (ORDER BY)
     */
    orderBy(column: keyof T, direction?: "asc" | "desc"): this;
    /**
     * Natijalar sonini cheklash (LIMIT)
     */
    limit(value: number): this;
    /**
     * Natijalarni tashlab o'tish (OFFSET)
     */
    offset(value: number): this;
    /**
     * Ma'lumotlarni olish (SELECT)
     */
    get(): Promise<T[]>;
    /**
     * Faqat birinchi qatorni olish
     */
    first(): Promise<T | null>;
    /**
     * Qatorlar sonini hisoblash
     */
    count(): Promise<number>;
    /**
     * Yangi qator qo'shish (INSERT)
     */
    create(data: Partial<T>): Promise<T>;
    /**
     * Bir nechta qator qo'shish (INSERT MANY)
     */
    createMany(data: Partial<T>[]): Promise<T[]>;
    /**
     * Ma'lumotni yangilash (UPDATE)
     */
    update(data: Partial<T>): Promise<T[]>;
    /**
     * Ma'lumotni o'chirish (DELETE)
     */
    delete(): Promise<void>;
    /**
     * Yordamchi metodlar
     */
    private validateTable;
    private compileWheres;
    private compileOrders;
    private reset;
}
