import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  datasource: {
    url: "mysql://root:abc123.@localhost:3306/pokeclicker",
  },
});
