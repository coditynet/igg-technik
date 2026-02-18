import { UniversalFooter } from "@/components/layout/universal-footer";

export default function LandingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="grid min-h-svh grid-rows-[auto_1fr_auto]">
			{children}
			<UniversalFooter />
		</div>
	);
}
