import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const developers = pgTable("developers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
});

export const bugs = pgTable("bugs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority").notNull(), // 'Low', 'Medium', 'High'
  status: text("status").notNull(), // 'Open', 'In Progress', 'Resolved'
  assigneeId: integer("assignee_id").references(() => developers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bugsRelations = relations(bugs, ({ one }) => ({
  assignee: one(developers, {
    fields: [bugs.assigneeId],
    references: [developers.id],
  }),
}));

export const developersRelations = relations(developers, ({ many }) => ({
  bugs: many(bugs),
}));

export const insertDeveloperSchema = createInsertSchema(developers).omit({ id: true });
export const insertBugSchema = createInsertSchema(bugs).omit({ id: true, createdAt: true });

export type Developer = typeof developers.$inferSelect;
export type InsertDeveloper = z.infer<typeof insertDeveloperSchema>;
export type Bug = typeof bugs.$inferSelect;
export type InsertBug = z.infer<typeof insertBugSchema>;

export type CreateBugRequest = InsertBug;
export type UpdateBugRequest = Partial<InsertBug>;
export type BugResponse = Bug & { assignee?: Developer | null };
