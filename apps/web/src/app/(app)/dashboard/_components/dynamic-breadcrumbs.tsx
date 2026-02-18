"use client";

import { usePathname } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
	dashboard: "Dashboard",
	calendar: "Kalender",
	events: "Events",
	history: "History",
	starred: "Favoriten",
	settings: "Einstellungen",
	groups: "Gruppen",
	general: "Allgemein",
	admin: "Admin",
	users: "Benutzer",
};

export function DynamicBreadcrumbs() {
	const pathname = usePathname();

	const segments = pathname.split("/").filter((segment) => segment !== "");

	if (segments.length === 1 && segments[0] === "dashboard") {
		return (
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbPage>Dashboard</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>
		);
	}

	let currentPath = "";
	const breadcrumbItems = segments.map((segment, index) => {
		currentPath += `/${segment}`;
		const label = routeLabels[segment] || segment;
		const isLast = index === segments.length - 1;

		return {
			label,
			path: currentPath,
			isLast,
		};
	});

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbItems.map((item, index) => (
					<div key={item.path} className="contents">
						<BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
							{item.isLast ? (
								<BreadcrumbPage>{item.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink href={item.path}>{item.label}</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{!item.isLast && (
							<BreadcrumbSeparator className="hidden md:block" />
						)}
					</div>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
