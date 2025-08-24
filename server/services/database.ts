import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type { QueryResult } from "@shared/schema";

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(process.cwd(), "data", "local.db");
    
    // Ensure data directory exists
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Create sample tables if they don't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        published BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if tables are empty and insert sample data
    const userCount = this.db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    
    if (userCount.count === 0) {
      this.db.exec(`
        INSERT INTO users (username, email, status) VALUES
        ('john_doe', 'john@example.com', 'active'),
        ('sarah_smith', 'sarah@example.com', 'active'),
        ('mike_wilson', 'mike@example.com', 'active'),
        ('emma_davis', 'emma@example.com', 'inactive'),
        ('alex_jones', 'alex@example.com', 'active');

        INSERT INTO posts (user_id, title, content, published) VALUES
        (1, 'Getting Started with SQL', 'A comprehensive guide to SQL basics...', 1),
        (1, 'Advanced Query Techniques', 'Learn about complex joins and subqueries...', 1),
        (2, 'Database Design Principles', 'Best practices for designing databases...', 1),
        (3, 'Performance Optimization', 'Tips for optimizing database performance...', 0),
        (1, 'Working with Indexes', 'Understanding how indexes improve query speed...', 1);

        INSERT INTO categories (name, description) VALUES
        ('Technology', 'Posts related to technology and programming'),
        ('Tutorial', 'Step-by-step tutorials and guides'),
        ('Best Practices', 'Industry best practices and recommendations');
      `);
    }
  }

  async executeQuery(sql: string): Promise<QueryResult> {
    const startTime = Date.now();
    
    try {
      // Determine if it's a SELECT query or a modification query
      const trimmedSql = sql.trim().toUpperCase();
      const isSelect = trimmedSql.startsWith('SELECT') || 
                     trimmedSql.startsWith('WITH') || 
                     trimmedSql.startsWith('SHOW') ||
                     trimmedSql.startsWith('DESCRIBE') ||
                     trimmedSql.startsWith('EXPLAIN');

      if (isSelect) {
        const stmt = this.db.prepare(sql);
        const rows = stmt.all();
        const executionTime = Date.now() - startTime;

        let columns: string[] = [];
        if (rows.length > 0) {
          columns = Object.keys(rows[0] as Record<string, any>);
        }

        return {
          columns,
          rows: rows.map((row: any) => columns.map(col => row[col])),
          rowCount: rows.length,
          executionTime
        };
      } else {
        // For INSERT, UPDATE, DELETE, etc.
        const stmt = this.db.prepare(sql);
        const result = stmt.run();
        const executionTime = Date.now() - startTime;

        return {
          columns: ['affected_rows', 'last_insert_id'],
          rows: [[result.changes, result.lastInsertRowid]],
          rowCount: result.changes,
          executionTime
        };
      }
    } catch (error) {
      throw new Error(`SQL execution failed: ${(error as Error).message}`);
    }
  }

  async getTables(): Promise<Array<{ name: string; type: string; rowCount: number }>> {
    const tables = this.db.prepare(`
      SELECT name, type 
      FROM sqlite_master 
      WHERE type IN ('table', 'view') 
      AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as Array<{ name: string; type: string }>;

    const result = [];
    for (const table of tables) {
      const countResult = this.db.prepare(`SELECT COUNT(*) as count FROM \`${table.name}\``).get() as { count: number };
      result.push({
        ...table,
        rowCount: countResult.count
      });
    }

    return result;
  }

  async getTableSchema(tableName: string): Promise<Array<{ name: string; type: string; pk: boolean; notnull: boolean }>> {
    return this.db.prepare(`PRAGMA table_info(\`${tableName}\`)`).all() as Array<{ 
      name: string; 
      type: string; 
      pk: boolean; 
      notnull: boolean; 
    }>;
  }

  async getTableData(tableName: string, limit = 100, offset = 0): Promise<{ data: any[]; total: number }> {
    const countResult = this.db.prepare(`SELECT COUNT(*) as count FROM \`${tableName}\``).get() as { count: number };
    const data = this.db.prepare(`SELECT * FROM \`${tableName}\` LIMIT ? OFFSET ?`).all(limit, offset);
    
    return {
      data,
      total: countResult.count
    };
  }

  async updateTableRow(tableName: string, id: string | number, data: Record<string, any>): Promise<void> {
    const columns = Object.keys(data);
    const setClause = columns.map(col => `\`${col}\` = ?`).join(', ');
    const values = columns.map(col => data[col]);
    
    const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE id = ?`;
    this.db.prepare(sql).run(...values, id);
  }

  async insertTableRow(tableName: string, data: Record<string, any>): Promise<void> {
    const columns = Object.keys(data);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map(col => data[col]);
    
    const sql = `INSERT INTO \`${tableName}\` (${columns.map(col => `\`${col}\``).join(', ')}) VALUES (${placeholders})`;
    this.db.prepare(sql).run(...values);
  }

  async deleteTableRow(tableName: string, id: string | number): Promise<void> {
    const sql = `DELETE FROM \`${tableName}\` WHERE id = ?`;
    this.db.prepare(sql).run(id);
  }

  close() {
    this.db.close();
  }
}

export const databaseService = new DatabaseService();
