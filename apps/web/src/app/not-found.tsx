import Link from "next/link";

export default function NotFound() {
	return (
		<div className="relative min-h-svh overflow-hidden bg-[#0a0a0a] text-[#e8e4de] selection:bg-[#ff3d00] selection:text-black">
			<div
				className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
				}}
			/>

			<div className="pointer-events-none absolute top-0 right-0 h-80 w-80 translate-x-20 -translate-y-20 rotate-12 border border-[#ff3d00]/20" />
			<div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-20 translate-y-20 rotate-12 border border-[#222]" />

			<div className="relative z-10 mx-auto flex min-h-svh w-full max-w-[1100px] items-center px-6 py-16">
				<div className="w-full">
					<div className="mb-5 font-mono text-[#ff3d00] text-[10px] uppercase tracking-[0.35em]">
						Seite nicht gefunden
					</div>

					<div className="grid gap-10 border-[#222] border-t pt-8 md:grid-cols-[auto_1fr] md:items-end">
						<div
							className="font-black text-[clamp(4rem,14vw,10rem)] leading-[0.85] tracking-[-0.05em] text-[#ff3d00]"
							style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}
						>
							404
						</div>

						<div>
							<h1
								className="font-black text-[clamp(1.6rem,4.4vw,3rem)] uppercase leading-[0.9] tracking-[-0.03em]"
								style={{ fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif" }}
							>
								Diese Seite
								<br />
								gibt es nicht.
							</h1>
							<p className="mt-4 max-w-xl font-mono text-[#888] text-xs leading-relaxed">
								Die URL ist ungültig oder die Seite wurde entfernt.
							</p>
						</div>
					</div>

					<div className="mt-10 flex flex-wrap items-center gap-3 border-[#222] border-t pt-6">
						<Link
							href="/"
							className="inline-flex items-center gap-2 bg-[#ff3d00] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-black transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_rgba(255,61,0,0.3)]"
						>
							Zur Startseite
						</Link>
						<Link
							href="/dashboard"
							className="inline-flex items-center gap-2 border border-[#222] bg-[#111] px-5 py-3 font-mono text-[#e8e4de] text-[10px] uppercase tracking-[0.16em] transition-colors hover:border-[#ff3d00]/40 hover:text-[#ff3d00]"
						>
							Zum Dashboard
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
