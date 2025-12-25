import type { AuthController, AuthState } from "@nubase/frontend";
import type { ApiEndpoints } from "__PROJECT_NAME__-schema";

const TOKEN_KEY = "__PROJECT_NAME___auth_token";

export class __PROJECT_NAME_PASCAL__AuthController implements AuthController<ApiEndpoints> {
	private token: string | null = null;

	constructor() {
		this.token = localStorage.getItem(TOKEN_KEY);
	}

	async getAuthState(
		httpClient: {
			request: <E extends keyof ApiEndpoints>(
				endpoint: E,
				options?: { body?: unknown; params?: unknown },
			) => Promise<ApiEndpoints[E]["responseBody"]>;
		},
		workspace: string,
	): Promise<AuthState> {
		if (!this.token) {
			return { isAuthenticated: false };
		}

		try {
			const response = await httpClient.request("getMe", {});
			return {
				isAuthenticated: true,
				user: response.user,
				workspace: response.workspace,
			};
		} catch {
			this.clearToken();
			return { isAuthenticated: false };
		}
	}

	getAuthHeaders(): Record<string, string> {
		if (!this.token) {
			return {};
		}
		return { Authorization: `Bearer ${this.token}` };
	}

	setToken(token: string): void {
		this.token = token;
		localStorage.setItem(TOKEN_KEY, token);
	}

	clearToken(): void {
		this.token = null;
		localStorage.removeItem(TOKEN_KEY);
	}

	getToken(): string | null {
		return this.token;
	}
}
