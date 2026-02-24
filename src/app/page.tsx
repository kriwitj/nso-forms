import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.isApproved) redirect("/login?pending=1");
  if (user.role === "ADMIN") redirect("/admin");
  redirect("/dashboard");
}
