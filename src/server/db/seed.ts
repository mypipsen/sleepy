import bcrypt from "bcryptjs";
import { db } from "./index";
import { users } from "./schema";

async function seed() {
  await db.insert(users).values({
    username: "admin",
    email: "admin@pipsen.dev",
    name: "Admin",
    password: await bcrypt.hash("admin", 10),
  });
}

seed()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
