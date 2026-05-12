import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../prisma/generated/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Parse DATABASE_URL to extract connection parameters
const parseConnectionUrl = (url: string) => {
  // Format: mysql://user:password@host:port/database
  const regex = /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/;
  const match = url.match(regex);

  if (!match) {
    throw new Error(`Invalid DATABASE_URL format: ${url}`);
  }

  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5],
  };
};

const connectionParams = parseConnectionUrl(
  process.env.DATABASE_URL || "mysql://root:abc123.@localhost:3306/pokeclicker",
);

const adapter = new PrismaMariaDb({
  host: connectionParams.host,
  port: connectionParams.port,
  user: connectionParams.user,
  password: connectionParams.password,
  database: connectionParams.database,
  connectionLimit: 5,
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
