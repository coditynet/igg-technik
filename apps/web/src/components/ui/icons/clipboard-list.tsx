"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { ClipboardList as AnimateClipboardList } from "@/components/animate-ui/icons/clipboard-list";

export interface ClipboardListIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

type ClipboardListIconProps = {
	className?: string;
	size?: number;
};

const ClipboardListIcon = forwardRef<
	ClipboardListIconHandle,
	ClipboardListIconProps
>(({ className, size = 24 }, ref) => {
	const [animate, setAnimate] = useState(false);

	useImperativeHandle(ref, () => ({
		startAnimation: () => setAnimate(true),
		stopAnimation: () => setAnimate(false),
	}));

	return (
		<AnimateClipboardList
			size={size}
			className={className}
			animate={animate ? "default" : false}
		/>
	);
});

ClipboardListIcon.displayName = "ClipboardListIcon";

export { ClipboardListIcon };
