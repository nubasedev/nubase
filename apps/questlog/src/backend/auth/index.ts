import { config } from "../backend-config";
import { QuestlogBackendAuthController } from "./QuestlogBackendAuthController";

export {
  QuestlogBackendAuthController,
  type QuestlogTokenPayload,
  type QuestlogUser,
} from "./QuestlogBackendAuthController";

/**
 * Singleton instance of the auth controller.
 * Use this in your Hono app setup.
 */
export const questlogAuthController = new QuestlogBackendAuthController(
  config.auth,
);
