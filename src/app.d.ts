declare global {
	namespace App {
		interface Locals {
			user: { id: string; username: string; displayName: string } | null;
			sessionId: string | null;
		}
	}
}

export {};
