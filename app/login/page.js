import { teamMembers } from "@/lib/config";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="login">
      <LoginForm members={teamMembers()} />
    </main>
  );
}
