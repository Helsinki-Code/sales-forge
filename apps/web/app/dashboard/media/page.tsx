import { MediaForm } from "@/components/media-form";
import { PageHeader } from "@/components/page-header";
import { ResourceTable } from "@/components/resource-table";
import { currentWorkspace } from "@/lib/auth";

export default async function Page() {
  const { supabase, membership } = await currentWorkspace();
  const [{ data: sites = [] }, { data: artifacts = [] }] = await Promise.all([
    supabase.from("sites").select("id,name").eq("workspace_id", membership?.workspace_id),
    supabase.from("artifacts").select("*,sites!inner(name,workspace_id)").eq("sites.workspace_id", membership?.workspace_id).order("created_at", { ascending: false }).limit(50),
  ]);
  return <><PageHeader title="Media studio" description="Learn each site’s visual language before generating accessible, provenance-tracked assets." /><div className="split"><MediaForm sites={sites || []} /><ResourceTable rows={artifacts || []} columns={[
    { key: "kind", label: "Kind" }, { key: "site", label: "Site", render: (row) => row.sites?.name },
    { key: "mime_type", label: "Format" }, { key: "bytes", label: "Size", render: (row) => `${Math.round(row.bytes / 1024)} KB` },
    { key: "public_url", label: "Asset", render: (row) => <a href={row.public_url}>Open ↗</a> },
  ]} /></div></>;
}
