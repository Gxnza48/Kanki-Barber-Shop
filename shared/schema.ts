import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Stored in ARS
  duration: integer("duration").notNull(), // Minutes
  imageUrl: text("image_url"),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientWhatsapp: text("client_whatsapp").notNull(),
  serviceId: integer("service_id").notNull(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  time: text("time").notNull(), // HH:mm
  status: text("status", { enum: ["pending", "confirmed", "cancelled"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Schemas
export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, status: true });
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });

// Types
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Admin = typeof admins.$inferSelect;
