import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { User, Workspace } from ".test-create-schema";

export interface .testCreateUser extends User {
	workspace: Workspace;
}

export interface TokenPayload {
	userId: number;
	workspaceId: number;
	email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export class .testCreateAuthController {
	async hashPassword(password: string): Promise<string> {
		return bcrypt.hash(password, 10);
	}

	async verifyPassword(password: string, hash: string): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}

	generateToken(payload: TokenPayload): string {
		return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
	}

	verifyToken(token: string): TokenPayload | null {
		try {
			return jwt.verify(token, JWT_SECRET) as TokenPayload;
		} catch {
			return null;
		}
	}
}
