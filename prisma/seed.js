const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@nso.local").toLowerCase();
  const name = process.env.ADMIN_NAME || "System Admin";
  const password = process.env.ADMIN_PASSWORD || "Admin@1234";

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash: hashPassword(password),
      role: "ADMIN",
      themePreference: "SYSTEM",
      isApproved: true,
    },
    create: {
      email,
      name,
      passwordHash: hashPassword(password),
      role: "ADMIN",
      themePreference: "SYSTEM",
      isApproved: true,
    },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
