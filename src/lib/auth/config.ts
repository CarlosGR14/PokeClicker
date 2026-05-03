import { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validar las credenciales con Zod
        const parsedCredentials = loginSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        // Buscar usuario en base de datos
        const user = await prisma.usuario.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        // Comparar contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.nombre,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      // Proteger rutas /game
      const isGameRoute = request.nextUrl.pathname.startsWith("/game");
      const isAuthenticated = !!auth?.user;

      if (isGameRoute && !isAuthenticated) {
        return false; // Redirige a signIn
      }
      return true;
    },
  },
};
