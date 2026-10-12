import DashHeader from "@/components/dashboard/DashHeader";
import PasswordForm from "@/components/dashboard/PasswordForm";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Account() {
  const { user } = await requireUser();
  return (
    <div className="dash">
      <DashHeader email={user.email ?? ""} />
      <main className="wrap dash-main">
        <a href="/dashboard" className="small muted">
          ← All venues
        </a>
        <h1>Your account</h1>
        <PasswordForm />
      </main>
    </div>
  );
}
