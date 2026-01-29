import { IDriver } from "../interfaces/driver.interface";
import { Grammar } from "./grammar";
export declare class Builder<T extends Record<string, unknown> = Record<string, unknown>> {
    protected driver: IDriver;
    protected _table: string;
    protected _wheres: Array<{
        column: keyof T;
        operator: string;
        value: unknown;
    }>;
    protected _bindings: unknown[];
    protected grammar: Grammar;
    constructor(driver: IDriver);
    /**
     * Jadval nomini belgilash va tipni zanjirga bog'lash
     */
    table<EntityType extends Record<string, unknown>>(name: string): Builder<EntityType>;
    /**
     * WHERE sharti. Faqat T modelidagi ustun nomlarini qabul qiladi
     */
    where(column: keyof T, operator: string, value: T[keyof T] | unknown): this;
    /**
     *  (SELECT)
     */
    get(): Promise<T[]>;
    /**
     * Faqat bitta qatorni olish
     */
    first(): Promise<T | null>;
    /**
     * (INSERT)
     */
    create(data: Partial<T>): Promise<T>;
    /**
     *  (UPDATE)
     */
    update(data: Partial<T>): Promise<T[]>;
    /**
     *  (DELETE)
     */
    delete(): Promise<void>;
    /**
     * Ichki yordamchi metodlar
     */
    private validateTable;
    private compileWheres;
    private reset;
}
