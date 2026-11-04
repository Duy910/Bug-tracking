import { redirect } from "next/navigation";
import { teamMembers, loginEnabled } from "@/lib/config";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  if (!loginEnabled()) redirect("/");
  return (
    <main className="login">
      <LoginForm members={teamMembers()} />
    </main>
  );
}
