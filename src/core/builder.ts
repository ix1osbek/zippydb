import { IDriver } from "../interfaces/driver.interface";
import { Grammar } from "./grammar";

export class Builder<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  protected _table: string = "";
  protected _wheres: Array<{
    column: keyof T;
    operator: string;
    value: unknown;
  }> = [];
  protected _bindings: unknown[] = [];
  protected grammar = new Grammar();

  constructor(protected driver: IDriver) {}

  /**
   * Jadval nomini belgilash va tipni zanjirga bog'lash
   */
  table<EntityType extends Record<string, unknown>>(
    name: string,
  ): Builder<EntityType> {
    const instance = new Builder<EntityType>(this.driver);
    instance._table = name;
    return instance;
  }

  /**
   * WHERE sharti. Faqat T modelidagi ustun nomlarini qabul qiladi
   */
  where(column: keyof T, operator: string, value: T[keyof T] | unknown): this {
    this._wheres.push({ column, operator, value });
    this._bindings.push(value);
    return this;
  }

  /**
   *  (SELECT)
   */
  async get(): Promise<T[]> {
    this.validateTable();
    const sql = this.grammar.compileSelect(this._table) + this.compileWheres();
    const results = await this.driver.execute<T>(sql, this._bindings);
    this.reset();
    return results;
  }

  /**
   * Faqat bitta qatorni olish
   */
  async first(): Promise<T | null> {
    const results = await this.get();
    return results.length > 0 ? results[0] : null;
  }

  /**
   * (INSERT)
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
   *  (UPDATE)
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

    // Bindings tartibi: avval SET qiymatlari, keyin WHERE qiymatlari
    const results = await this.driver.execute<T>(sql, [
      ...values,
      ...this._bindings,
    ]);
    this.reset();
    return results;
  }

  /**
   *  (DELETE)
   */
  async delete(): Promise<void> {
    this.validateTable();
    const sql = this.grammar.compileDelete(this._table, this._wheres);
    await this.driver.execute(sql, this._bindings);
    this.reset();
  }

  /**
   * Ichki yordamchi metodlar
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

  private reset(): void {
    this._wheres = [];
    this._bindings = [];
  }
}
