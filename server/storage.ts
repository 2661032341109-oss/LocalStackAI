import { type User, type InsertUser, type Query, type InsertQuery } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Query management
  getQueries(userId?: string): Promise<Query[]>;
  saveQuery(query: InsertQuery): Promise<Query>;
  deleteQuery(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private queries: Map<string, Query>;

  constructor() {
    this.users = new Map();
    this.queries = new Map();
    
    // Create default user
    const defaultUser: User = {
      id: "default-user",
      username: "localuser",
      email: "user@localhost",
      password: "password",
      status: "active",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      status: insertUser.status || "active",
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async getQueries(userId?: string): Promise<Query[]> {
    const queries = Array.from(this.queries.values());
    return userId ? queries.filter(q => q.userId === userId) : queries;
  }

  async saveQuery(insertQuery: InsertQuery): Promise<Query> {
    const id = randomUUID();
    const query: Query = {
      ...insertQuery,
      id,
      userId: insertQuery.userId || null,
      createdAt: new Date(),
    };
    this.queries.set(id, query);
    return query;
  }

  async deleteQuery(id: string): Promise<void> {
    this.queries.delete(id);
  }
}

export const storage = new MemStorage();
