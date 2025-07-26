import { useNubaseContext } from "../../components/nubase-app/NubaseContextProvider";

export default function IndexScreen() {
  const context = useNubaseContext();
  const { config } = context;

  return (
    <div className="space-y-8 pt-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Welcome to {config.appName}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your Nubase application is ready.
        </p>
      </div>
    </div>
  );
}
