"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

type AppSessionProviderProps = {
	children: ReactNode;
};

export function AppSessionProvider({ children }: AppSessionProviderProps) {
	return <SessionProvider>{children}</SessionProvider>;
}
