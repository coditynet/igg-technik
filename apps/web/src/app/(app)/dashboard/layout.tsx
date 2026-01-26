import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "./_components/dashboard-header";
import { AppSidebar } from "./_components/sidebar/app-sidebar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<style>
				{`body, html { overscroll-behavior: none !important; }`}
			</style>
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<DashboardHeader />
					<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
				</SidebarInset>
			</SidebarProvider>
		</>
	);
}
