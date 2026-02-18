"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "./_components/dashboard-header";
import { MobileSidebarTrigger } from "./_components/mobile-sidebar-trigger";
import { AppSidebar } from "./_components/sidebar/app-sidebar";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { PageLoader } from "@/components/page-loader";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();

	function UnauthedRedirect() {
		useEffect(() => {
			router.replace("/sign-in");
		}, [router]);
		return <PageLoader />;
	}

	return (
		<>
			<Authenticated>
				<style>{"body, html { overscroll-behavior: none !important; }"}</style>
				<SidebarProvider>
					<AppSidebar />
					<SidebarInset>
						<DashboardHeader />
						<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
							<div className="mx-auto h-full w-full max-w-7xl">
								{children}
							</div>
						</div>
					</SidebarInset>
					<MobileSidebarTrigger />
				</SidebarProvider>
			</Authenticated>
			<AuthLoading>
				<PageLoader />
			</AuthLoading>
			<Unauthenticated>
				<UnauthedRedirect />
			</Unauthenticated>
		</>
	);
}