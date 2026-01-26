"use client";

import { cn } from "@/lib/utils";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface SunIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface SunIconProps extends HTMLMotionProps<"div"> {
	size?: number;
	duration?: number;
	isAnimated?: boolean;
}

const SunIcon = forwardRef<SunIconHandle, SunIconProps>(
	(
		{
			onMouseEnter,
			onMouseLeave,
			className,
			size = 24,
			duration = 0.6,
			isAnimated = true,
			...props
		},
		ref,
	) => {
		const controls = useAnimation();
		const reduced = useReducedMotion();
		const isControlled = useRef(false);

		useImperativeHandle(ref, () => {
			isControlled.current = true;
			return {
				startAnimation: () =>
					reduced ? controls.start("normal") : controls.start("animate"),
				stopAnimation: () => controls.start("normal"),
			};
		});

		const handleEnter = useCallback(
			(e?: React.MouseEvent<HTMLDivElement>) => {
				if (!isAnimated || reduced) return;
				if (!isControlled.current) controls.start("animate");
				else onMouseEnter?.(e as any);
			},
			[controls, reduced, isAnimated, onMouseEnter],
		);

		const handleLeave = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlled.current) {
					controls.start("normal");
				} else {
					onMouseLeave?.(e);
				}
			},
			[controls, onMouseLeave],
		);

		const circleVariant: Variants = {
			normal: { rotate: 0 },
			animate: {
				rotate: [0, -10, 10, 0],
				transition: { duration, ease: "easeInOut", repeat: 0 },
			},
		};

		const lineVariant: Variants = {
			normal: { opacity: 1, pathLength: 1 },
			animate: {
				opacity: [0, 1],
				pathLength: [0, 1],
				transition: { duration, ease: "easeInOut", repeat: 0 },
			},
		};

		return (
			<motion.div
				className={cn("inline-flex items-center justify-center", className)}
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
				{...props}
			>
				<motion.svg
					xmlns="http://www.w3.org/2000/svg"
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
					animate={controls}
					initial="normal"
				>
					<motion.circle cx="12" cy="12" r="4" variants={circleVariant} />
					<motion.path d="M12 2v2" variants={lineVariant} />
					<motion.path d="M12 20v2" variants={lineVariant} />
					<motion.path d="m4.93 4.93 1.41 1.41" variants={lineVariant} />
					<motion.path d="m17.66 17.66 1.41 1.41" variants={lineVariant} />
					<motion.path d="M2 12h2" variants={lineVariant} />
					<motion.path d="M20 12h2" variants={lineVariant} />
					<motion.path d="m6.34 17.66-1.41 1.41" variants={lineVariant} />
					<motion.path d="m19.07 4.93-1.41 1.41" variants={lineVariant} />
				</motion.svg>
			</motion.div>
		);
	},
);

SunIcon.displayName = "SunIcon";
export { SunIcon };
