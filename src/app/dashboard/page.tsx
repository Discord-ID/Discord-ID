import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { DashboardEditor } from "@/components/dashboard-editor";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/login?callbackUrl=/dashboard");
	}

	if (session.role !== "admin" && session.role !== "moderator") {
		redirect("/login?error=NotAdmin");
	}

	return <DashboardEditor />;
}
