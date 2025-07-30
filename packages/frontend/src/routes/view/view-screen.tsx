import { useParams } from "@tanstack/react-router";
import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";
import { ViewRenderer } from "../../components/views/ViewRenderer/ViewRenderer";

export default function ViewScreen() {
  const { view } = useParams({ from: "/v/$view" });
  const context = useNubaseContext();

  // we need to make sure that the view is in the config.views object
  if (!context.config.views[view]) {
    return <div>View not found</div>;
  }

  return <ViewRenderer view={context.config.views[view]} />;
}
