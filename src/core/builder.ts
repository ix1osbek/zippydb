import { IDriver } from "../interfaces/driver.interface";
import { Grammar } from "./grammar";

export class Builder<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  protected _table: string = "";
  protected _columns: string[] = ["*"];
  protected _wheres: Array<{
    column: keyof T;
    operator: string;
    value: unknown;
  }> = [];
  protected _orders: Array<{ column: keyof T; direction: "asc" | "desc" }> = [];
  protected _limit: number | null = null;
  protected _offset: number | null = null;
  protected _distinct: boolean = false;
  protected _bindings: unknown[] = [];
  protected grammar = new Grammar();

  constructor(protected driver: IDriver) {}

  /**
   * Jadval nomini belgilash va yangi instance qaytarish
   */
  table<EntityType extends Record<string, unknown>>(
    name: string,
  ): Builder<EntityType> {
    const instance = new Builder<EntityType>(this.driver);
    instance._table = name;
    return instance;
  }

  /**
   * SELECT qilinadigan ustunlarni belgilash
   */
  select(...columns: (keyof T | "*")[]): this {
    this._columns = columns as string[];
    return this;
  }

  /**
   * Dublikatlarni olib tashlash
   */
  distinct(): this {
    this._distinct = true;
    return this;
  }

  /**
   * WHERE sharti
   */
  where(column: keyof T, operator: string, value: T[keyof T] | unknown): this {
    this._wheres.push({ column, operator, value });
    this._bindings.push(value);
    return this;
  }

  /**
   * Tartiblash (ORDER BY)
   */
  orderBy(column: keyof T, direction: "asc" | "desc" = "asc"): this {
    this._orders.push({ column, direction });
    return this;
  }

  /**
   * Natijalar sonini cheklash (LIMIT)
   */
  limit(value: number): this {
    this._limit = value;
    return this;
  }

  /**
   * Natijalarni tashlab o'tish (OFFSET)
   */
  offset(value: number): this {
    this._offset = value;
    return this;
  }

  /**
   * Ma'lumotlarni olish (SELECT)
   */
  async get(): Promise<T[]> {
    this.validateTable();

    // SQL generatorini ishga tushiramiz
    let sql = this.grammar.compileSelect(this._table, this._columns);

    if (this._distinct) sql = sql.replace("SELECT", "SELECT DISTINCT");

    sql += this.compileWheres();
    sql += this.compileOrders();

    if (this._limit !== null) sql += ` LIMIT ${this._limit}`;
    if (this._offset !== null) sql += ` OFFSET ${this._offset}`;

    const results = await this.driver.execute<T>(sql, this._bindings);
    this.reset();
    return results;
  }

  /**
   * Faqat birinchi qatorni olish
   */
  async first(): Promise<T | null> {
    this.limit(1);
    const results = await this.get();
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Qatorlar sonini hisoblash
   */
  async count(): Promise<number> {
    this.validateTable();
    const sql = `SELECT COUNT(*) as count FROM ${this._table}${this.compileWheres()}`;
    const result = await this.driver.execute<{ count: string }>(
      sql,
      this._bindings,
    );
    this.reset();
    return parseInt(result[0].count, 10);
  }

  /**
   * Yangi qator qo'shish (INSERT)
   */
  async create(data: Partial<T>): Promise<T> {
    this.validateTable();
    const { sql, values } = this.grammar.compileInsert(
      this._table,
      data as Record<string, unknown>,
    );
    const result = await this.driver.execute<T>(sql, values);
    this.reset();
    return result[0];
  }

  /**
   * Bir nechta qator qo'shish (INSERT MANY)
   */
  async createMany(data: Partial<T>[]): Promise<T[]> {
    this.validateTable();
    // Sodda implementatsiya: har birini alohida qo'shish yoki Grammar'ga createMany qo'shish kerak
    const results: T[] = [];
    for (const item of data) {
      results.push(await this.create(item));
    }
    return results;
  }

  /**
   * Ma'lumotni yangilash (UPDATE)
   */
  async update(data: Partial<T>): Promise<T[]> {
    this.validateTable();
    if (Object.keys(data).length === 0)
      throw new Error("Update uchun ma'lumot berilmadi.");

    const { sql, values } = this.grammar.compileUpdate(
      this._table,
      data as Record<string, unknown>,
      this._wheres,
    );

    const results = await this.driver.execute<T>(sql, [
      ...values,
      ...this._bindings,
    ]);
    this.reset();
    return results;
  }

  /**
   * Ma'lumotni o'chirish (DELETE)
   */
  async delete(): Promise<void> {
    this.validateTable();
    const sql = this.grammar.compileDelete(this._table, this._wheres);
    await this.driver.execute(sql, this._bindings);
    this.reset();
  }

  /**
   * Yordamchi metodlar
   */
  private validateTable(): void {
    if (!this._table)
      throw new Error(
        "Jadval nomi ko'rsatilmagan. .table() metodini chaqiring.",
      );
  }

  private compileWheres(): string {
    if (this._wheres.length === 0) return "";
    const conditions = this._wheres.map(
      (w, i) => `${String(w.column)} ${w.operator} $${i + 1}`,
    );
    return ` WHERE ${conditions.join(" AND ")}`;
  }

  private compileOrders(): string {
    if (this._orders.length === 0) return "";
    const orders = this._orders.map(
      (o) => `${String(o.column)} ${o.direction.toUpperCase()}`,
    );
    return ` ORDER BY ${orders.join(", ")}`;
  }

  private reset(): void {
    this._wheres = [];
    this._bindings = [];
    this._columns = ["*"];
    this._limit = null;
    this._offset = null;
    this._orders = [];
    this._distinct = false;
  }
}
