import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ResourceTable } from "@/components/resource-table";
import { SiteActions } from "@/components/site-actions";
import { currentWorkspace } from "@/lib/auth";

export default async function Page() {
  const { membership, supabase } = await currentWorkspace();
  const { data = [] } = await supabase.from("sites").select("*").eq("workspace_id", membership?.workspace_id).order("created_at", { ascending: false });
  return <><PageHeader title="Sites" description="Every site is isolated to one workspace and one protected publishing target." action={<Link className="button primary" href="/dashboard/onboarding">+ Connect site</Link>} /><ResourceTable rows={data || []} columns={[
    { key: "name", label: "Site", render:(row)=><Link className="table-link" href={`/dashboard/sites/${row.id}`}>{row.name} →</Link> }, { key: "url", label: "Live URL" },
    { key: "publishing_target", label: "Publishing", render: (row) => row.publishing_target === "wordpress" ? "WordPress" : `${row.repository_owner}/${row.repository_name}` },
    { key: "status", label: "Status", render: (row) => <span className="badge">{row.status}</span> },
    { key: "publishing_target", label: "Workflow", render: (row) => row.publishing_target === "wordpress" ? "Draft → approve → publish" : "PR → approve → merge" }, { key: "actions", label: "Actions", render: (row) => <SiteActions siteId={row.id} status={row.status} /> },
  ]} /></>;
}
