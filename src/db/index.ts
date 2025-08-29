/*
Drizzle is not used for database interactions, just for migrations.
*/

// import { drizzle } from "drizzle-orm/postgres-js";
// import postgres from "postgres";
// import * as schema from "./schema";

// const connectionString = process.env.DATABASE_URL || "";

// if (!connectionString) {
//   console.warn(
//     "Missing DATABASE_URL environment variable - used for migrations"
//   );
// }

// const client = postgres(connectionString);
// export const db = drizzle(client, { schema });

export * from "./schema";
