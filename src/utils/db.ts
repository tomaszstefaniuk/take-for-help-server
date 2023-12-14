const { PrismaClient } = require("@prisma/client");

const db = new PrismaClient();

export default db;
