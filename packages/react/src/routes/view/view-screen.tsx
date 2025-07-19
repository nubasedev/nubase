import { useParams } from "@tanstack/react-router";
import { ViewRenderer } from "../../components/views/ViewRenderer/ViewRenderer";
import { useNubaseConfig } from "../../config/NubaseConfigContext";

export default function ViewScreen() {
  const { view } = useParams({ from: "/v/$view" });
  const config = useNubaseConfig();

  // we need to make sure that the view is in the config.views object
  if (!config.views[view]) {
    return <div>View not found</div>;
  }

  return <ViewRenderer view={config.views[view]} />;
}
