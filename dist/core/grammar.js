"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grammar = void 0;
class Grammar {
    /**
     * SELECT
     */
    compileSelect(table, columns = ["*"]) {
        const cols = columns.length > 0 ? columns.join(", ") : "*";
        return `SELECT ${cols} FROM ${table}`;
    }
    /**
     * INSERT
     */
    compileInsert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
        const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders}) RETURNING *`;
        return { sql, values };
    }
    /**
     * UPDATE
     */
    compileUpdate(table, data, wheres) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        // SET 
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
        let sql = `UPDATE ${table} SET ${setClause}`;
        // WHERE 
        if (wheres.length > 0) {
            const whereClause = wheres
                .map((w, i) => `${String(w.column)} ${w.operator} $${keys.length + i + 1}`)
                .join(" AND ");
            sql += ` WHERE ${whereClause}`;
        }
        return { sql, values };
    }
    /**
     * DELETE
     */
    compileDelete(table, wheres) {
        let sql = `DELETE FROM ${table}`;
        if (wheres.length > 0) {
            const whereClause = wheres
                .map((w, i) => `${String(w.column)} ${w.operator} $${i + 1}`)
                .join(" AND ");
            sql += ` WHERE ${whereClause}`;
        }
        return sql;
    }
}
exports.Grammar = Grammar;
