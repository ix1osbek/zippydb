"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builder = void 0;
const grammar_1 = require("./grammar");
class Builder {
    constructor(driver) {
        this.driver = driver;
        this._table = "";
        this._columns = ["*"];
        this._wheres = [];
        this._orders = [];
        this._limit = null;
        this._offset = null;
        this._distinct = false;
        this._bindings = [];
        this.grammar = new grammar_1.Grammar();
    }
    /**
     * Jadval nomini belgilash va yangi instance qaytarish
     */
    table(name) {
        const instance = new Builder(this.driver);
        instance._table = name;
        return instance;
    }
    /**
     * SELECT qilinadigan ustunlarni belgilash
     */
    select(...columns) {
        this._columns = columns;
        return this;
    }
    /**
     * Dublikatlarni olib tashlash
     */
    distinct() {
        this._distinct = true;
        return this;
    }
    /**
     * WHERE sharti
     */
    where(column, operator, value) {
        this._wheres.push({ column, operator, value });
        this._bindings.push(value);
        return this;
    }
    /**
     * Tartiblash (ORDER BY)
     */
    orderBy(column, direction = "asc") {
        this._orders.push({ column, direction });
        return this;
    }
    /**
     * Natijalar sonini cheklash (LIMIT)
     */
    limit(value) {
        this._limit = value;
        return this;
    }
    /**
     * Natijalarni tashlab o'tish (OFFSET)
     */
    offset(value) {
        this._offset = value;
        return this;
    }
    /**
     * Ma'lumotlarni olish (SELECT)
     */
    async get() {
        this.validateTable();
        // SQL generatorini ishga tushiramiz
        let sql = this.grammar.compileSelect(this._table, this._columns);
        if (this._distinct)
            sql = sql.replace("SELECT", "SELECT DISTINCT");
        sql += this.compileWheres();
        sql += this.compileOrders();
        if (this._limit !== null)
            sql += ` LIMIT ${this._limit}`;
        if (this._offset !== null)
            sql += ` OFFSET ${this._offset}`;
        const results = await this.driver.execute(sql, this._bindings);
        this.reset();
        return results;
    }
    /**
     * Faqat birinchi qatorni olish
     */
    async first() {
        this.limit(1);
        const results = await this.get();
        return results.length > 0 ? results[0] : null;
    }
    /**
     * Qatorlar sonini hisoblash
     */
    async count() {
        this.validateTable();
        const sql = `SELECT COUNT(*) as count FROM ${this._table}${this.compileWheres()}`;
        const result = await this.driver.execute(sql, this._bindings);
        this.reset();
        return parseInt(result[0].count, 10);
    }
    /**
     * Yangi qator qo'shish (INSERT)
     */
    async create(data) {
        this.validateTable();
        const { sql, values } = this.grammar.compileInsert(this._table, data);
        const result = await this.driver.execute(sql, values);
        this.reset();
        return result[0];
    }
    /**
     * Bir nechta qator qo'shish (INSERT MANY)
     */
    async createMany(data) {
        this.validateTable();
        // Sodda implementatsiya: har birini alohida qo'shish yoki Grammar'ga createMany qo'shish kerak
        const results = [];
        for (const item of data) {
            results.push(await this.create(item));
        }
        return results;
    }
    /**
     * Ma'lumotni yangilash (UPDATE)
     */
    async update(data) {
        this.validateTable();
        if (Object.keys(data).length === 0)
            throw new Error("Update uchun ma'lumot berilmadi.");
        const { sql, values } = this.grammar.compileUpdate(this._table, data, this._wheres);
        const results = await this.driver.execute(sql, [
            ...values,
            ...this._bindings,
        ]);
        this.reset();
        return results;
    }
    /**
     * Ma'lumotni o'chirish (DELETE)
     */
    async delete() {
        this.validateTable();
        const sql = this.grammar.compileDelete(this._table, this._wheres);
        await this.driver.execute(sql, this._bindings);
        this.reset();
    }
    /**
     * Yordamchi metodlar
     */
    validateTable() {
        if (!this._table)
            throw new Error("Jadval nomi ko'rsatilmagan. .table() metodini chaqiring.");
    }
    compileWheres() {
        if (this._wheres.length === 0)
            return "";
        const conditions = this._wheres.map((w, i) => `${String(w.column)} ${w.operator} $${i + 1}`);
        return ` WHERE ${conditions.join(" AND ")}`;
    }
    compileOrders() {
        if (this._orders.length === 0)
            return "";
        const orders = this._orders.map((o) => `${String(o.column)} ${o.direction.toUpperCase()}`);
        return ` ORDER BY ${orders.join(", ")}`;
    }
    reset() {
        this._wheres = [];
        this._bindings = [];
        this._columns = ["*"];
        this._limit = null;
        this._offset = null;
        this._orders = [];
        this._distinct = false;
    }
}
exports.Builder = Builder;
