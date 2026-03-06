import { db } from "./db";
import {
  developers,
  bugs,
  type Developer,
  type InsertDeveloper,
  type Bug,
  type InsertBug,
  type UpdateBugRequest,
  type BugResponse
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Developers
  getDevelopers(): Promise<Developer[]>;
  createDeveloper(developer: InsertDeveloper): Promise<Developer>;
  
  // Bugs
  getBugs(): Promise<BugResponse[]>;
  getBug(id: number): Promise<BugResponse | undefined>;
  createBug(bug: InsertBug): Promise<Bug>;
  updateBug(id: number, updates: UpdateBugRequest): Promise<Bug>;
  deleteBug(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Developers
  async getDevelopers(): Promise<Developer[]> {
    return await db.select().from(developers);
  }

  async createDeveloper(developer: InsertDeveloper): Promise<Developer> {
    const [created] = await db.insert(developers).values(developer).returning();
    return created;
  }

  // Bugs
  async getBugs(): Promise<BugResponse[]> {
    const allBugs = await db.select().from(bugs);
    const allDevelopers = await this.getDevelopers();
    
    return allBugs.map(bug => {
      const assignee = bug.assigneeId 
        ? allDevelopers.find(d => d.id === bug.assigneeId) 
        : null;
      return { ...bug, assignee };
    });
  }

  async getBug(id: number): Promise<BugResponse | undefined> {
    const [bug] = await db.select().from(bugs).where(eq(bugs.id, id));
    if (!bug) return undefined;
    
    let assignee = null;
    if (bug.assigneeId) {
      const [dev] = await db.select().from(developers).where(eq(developers.id, bug.assigneeId));
      assignee = dev;
    }
    
    return { ...bug, assignee };
  }

  async createBug(bug: InsertBug): Promise<Bug> {
    const [created] = await db.insert(bugs).values(bug).returning();
    return created;
  }

  async updateBug(id: number, updates: UpdateBugRequest): Promise<Bug> {
    const [updated] = await db.update(bugs)
      .set(updates)
      .where(eq(bugs.id, id))
      .returning();
    return updated;
  }

  async deleteBug(id: number): Promise<void> {
    await db.delete(bugs).where(eq(bugs.id, id));
  }
}

export const storage = new DatabaseStorage();
