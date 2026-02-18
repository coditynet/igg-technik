export function PageLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
            <div className="relative h-[2px] w-16 overflow-hidden bg-[#222]">
                <div
                    className="absolute inset-y-0 left-0 w-1/2 bg-[#ff3d00]"
                    style={{
                        animation: "scanBar 0.8s ease-in-out infinite",
                    }}
                />
                <style>{`
				@keyframes scanBar {
					0% { left: -50%; }
					100% { left: 100%; }
                    }
                    `}</style>
            </div>
        </div>
    );
}