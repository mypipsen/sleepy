import { db } from "./index";

async function reset() {
  // This drops everything in the current database
  await db.execute("DROP SCHEMA drizzle CASCADE;");
  await db.execute("DROP SCHEMA public CASCADE;");
  await db.execute("CREATE SCHEMA public;");

  console.log("Database reset complete.");
}

reset()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
