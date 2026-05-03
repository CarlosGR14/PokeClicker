import { auth } from "@/lib/auth/auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}
