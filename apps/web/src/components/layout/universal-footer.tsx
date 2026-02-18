"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function UniversalFooter() {
	const pathname = usePathname();
	const isLanding = pathname === "/";

	const handleSecretClick = () => {
		if (!isLanding) return;
		window.scrollTo({ top: 0, behavior: "smooth" });
		window.setTimeout(() => {
			window.dispatchEvent(new CustomEvent("landing-secret-trigger"));
		}, 450);
	};

	return (
		<footer className="border-[#222] border-t px-6 py-8">
			<div className="mx-auto flex max-w-[1400px] items-center justify-between">
				<button
					type="button"
					onClick={handleSecretClick}
					className="bg-transparent p-0 font-mono text-[#444] text-[10px] uppercase tracking-[0.3em] transition-colors hover:text-[#ff3d00]"
				>
					IGG Technik {new Date().getFullYear()}
				</button>
				<Link
					href="https://codity.app"
					target="_blank"
					rel="noreferrer"
					className="font-mono text-[#444] text-[10px] uppercase tracking-[0.2em]"
				>
					Made by Codity
				</Link>
			</div>
		</footer>
	);
}
