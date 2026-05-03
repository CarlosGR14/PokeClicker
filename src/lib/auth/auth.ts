import NextAuth from "next-auth";
import { authConfig } from "./config";

// NextAuth maneja autenticación + protección de rutas (callback authorized en config.ts)
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
