import { AppNav } from "@/components/app-nav";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({children}:{children:React.ReactNode}) {
  await requireUser();
  return <div className="app-shell"><AppNav/><main className="app-main">{children}</main></div>;
}
