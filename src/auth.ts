import NextAuth, { type NextAuthOptions, type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { loginSchema } from "@/lib/validations/auth";

// Extender tipos de NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: false, // Cambiar a false en desarrollo

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos");
        }

        // Validar con Zod
        const result = loginSchema.safeParse({
          email: credentials.email,
          password: credentials.password,
        });

        if (!result.success) {
          throw new Error("Credenciales inválidas");
        }

        // Buscar usuario en BD
        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });

        if (!usuario) {
          throw new Error("Email o contraseña incorrectos");
        }

        // Validar contraseña
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          usuario.password,
        );

        if (!isPasswordValid) {
          throw new Error("Email o contraseña incorrectos");
        }

        // Retornar datos del usuario (se pasarán al callback JWT)
        return {
          id: usuario.id.toString(),
          email: usuario.email,
          name: usuario.nombre,
          role: usuario.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },

  callbacks: {
    async jwt({ token, user }) {
      // Cuando se autentica el usuario, agregamos sus datos al token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      // Pasamos datos del token a la sesión disponible en el cliente
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
