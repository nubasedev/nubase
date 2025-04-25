import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Card } from "@repo/ui/card";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Card />
	</StrictMode>,
);
