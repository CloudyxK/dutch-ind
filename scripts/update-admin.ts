import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("kontolbebek343#", 12);

  const result = await prisma.user.updateMany({
    where: { role: "ADMIN" },
    data: {
      email:    "adinbilok@gmail.com",
      password: hash,
    },
  });

  console.log(`Updated ${result.count} admin account(s)`);
  console.log("Email   : adinbilok@gmail.com");
  console.log("Password: kontolbebek343#");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
