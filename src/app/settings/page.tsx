import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { UserProfileSettings } from "@/components/settings/user-profile-settings";
import { authOptions } from "@/lib/auth";

export default async function SettingsPage() {
	const session = await getServerSession(authOptions);

	if (!session) {
		redirect("/login?callbackUrl=/settings");
	}

	if (
		session.role !== "dev" &&
		session.role !== "admin" &&
		session.role !== "moderator"
	) {
		redirect("/login?error=Forbidden");
	}

	return <UserProfileSettings />;
}
