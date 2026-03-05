// import TagDashboard from "@/components/tags/TagDashboard";

// export default async function TagsPage() {

//   return <TagDashboard />;
// }

import TagsDashboard from "@/components/tags/TagDashboard";
import { fetchPanels } from "@/lib/panel/panel-actions";

export default async function Page() {
  const panels = await fetchPanels();
  // const panels = (await fetchPanels().catch(() => [])) || [];
  console.log(panels)

  return <TagsDashboard initialPanels={panels} />;
}
