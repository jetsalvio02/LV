import {
  pgEnum,
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user_role_enum = pgEnum("user_role", ["ADMIN", "USER"]);

export const poll_status_enum = pgEnum("poll_status", [
  "DRAFT",
  "ACTIVE",
  "CLOSED",
]);

export const poll_type_enum = pgEnum("poll_type", [
  "YES_NO",
  "MULTIPLE_CHOICE",
]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name"),

    email: text("email").notNull(),
    password: text("password").notNull(),

    role: user_role_enum("role").default("USER"),

    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    email_unique: uniqueIndex("users_email_unique").on(table.email),
  })
);

export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),

  title: text("title").notNull(),
  description: text("description"),

  type: poll_type_enum("type").notNull(),
  status: poll_status_enum("status").default("DRAFT"),

  image_url: text("image_url"),

  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

export const poll_options = pgTable("poll_options", {
  id: serial("id").primaryKey(),

  poll_id: integer("poll_id")
    .notNull()
    .references(() => polls.id, { onDelete: "cascade" }),

  label: text("label").notNull(),

  image_url: text("image_url"),
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),

  poll_id: integer("poll_id")
    .notNull()
    .references(() => polls.id, { onDelete: "cascade" }),

  option_id: integer("option_id")
    .notNull()
    .references(() => poll_options.id, { onDelete: "cascade" }),

  user_id: integer("user_id").references(() => users.id),

  created_at: timestamp("created_at").defaultNow(),
});
