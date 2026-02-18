import { redirect } from "next/navigation";

export default function DashboardSettingsGroupsRedirectPage() {
	redirect("/dashboard/groups" as never);
}
