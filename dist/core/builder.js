"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builder = void 0;
const grammar_1 = require("./grammar");
class Builder {
    constructor(driver) {
        this.driver = driver;
        this._table = "";
        this._wheres = [];
        this._bindings = [];
        this.grammar = new grammar_1.Grammar();
    }
    /**
     * Jadval nomini belgilash va tipni zanjirga bog'lash
     */
    table(name) {
        const instance = new Builder(this.driver);
        instance._table = name;
        return instance;
    }
    /**
     * WHERE sharti. Faqat T modelidagi ustun nomlarini qabul qiladi
     */
    where(column, operator, value) {
        this._wheres.push({ column, operator, value });
        this._bindings.push(value);
        return this;
    }
    /**
     *  (SELECT)
     */
    async get() {
        this.validateTable();
        const sql = this.grammar.compileSelect(this._table) + this.compileWheres();
        const results = await this.driver.execute(sql, this._bindings);
        this.reset();
        return results;
    }
    /**
     * Faqat bitta qatorni olish
     */
    async first() {
        const results = await this.get();
        return results.length > 0 ? results[0] : null;
    }
    /**
     * (INSERT)
     */
    async create(data) {
        this.validateTable();
        const { sql, values } = this.grammar.compileInsert(this._table, data);
        const result = await this.driver.execute(sql, values);
        this.reset();
        return result[0];
    }
    /**
     *  (UPDATE)
     */
    async update(data) {
        this.validateTable();
        if (Object.keys(data).length === 0)
            throw new Error("Update uchun ma'lumot berilmadi.");
        const { sql, values } = this.grammar.compileUpdate(this._table, data, this._wheres);
        // Bindings tartibi: avval SET qiymatlari, keyin WHERE qiymatlari
        const results = await this.driver.execute(sql, [
            ...values,
            ...this._bindings,
        ]);
        this.reset();
        return results;
    }
    /**
     *  (DELETE)
     */
    async delete() {
        this.validateTable();
        const sql = this.grammar.compileDelete(this._table, this._wheres);
        await this.driver.execute(sql, this._bindings);
        this.reset();
    }
    /**
     * Ichki yordamchi metodlar
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
    reset() {
        this._wheres = [];
        this._bindings = [];
    }
}
exports.Builder = Builder;
