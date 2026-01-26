"use client";

import { cn } from "@/lib/utils";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface SunMoonIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface SunMoonIconProps extends HTMLMotionProps<"div"> {
	size?: number;
	duration?: number;
	isAnimated?: boolean;
}

const SunMoonIcon = forwardRef<SunMoonIconHandle, SunMoonIconProps>(
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

		const path1Variant: Variants = {
			normal: { rotate: 0 },
			animate: {
				rotate: [0, -10, 10, 0],
				transition: { duration, ease: "easeInOut", repeat: 0 },
			},
		};

		const path2Variant: Variants = {
			normal: {},
			animate: {},
		};

		const lineVariant = (delay: number): Variants => ({
			normal: { opacity: 1, pathLength: 1 },
			animate: {
				opacity: [0, 1],
				pathLength: [0, 1],
				transition: { duration, ease: "easeInOut", delay, repeat: 0 },
			},
		});

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
					<motion.path
						d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"
						variants={path1Variant}
					/>
					<motion.path d="M16 12a4 4 0 0 0-4-4" variants={path2Variant} />
					<motion.line
						x1="12"
						y1="4"
						x2="12"
						y2="2"
						variants={lineVariant(0)}
					/>
					<motion.line
						x1="17.7"
						y1="6.3"
						x2="19"
						y2="5"
						variants={lineVariant(0.15)}
					/>
					<motion.line
						x1="20"
						y1="12"
						x2="22"
						y2="12"
						variants={lineVariant(0.3)}
					/>
				</motion.svg>
			</motion.div>
		);
	},
);

SunMoonIcon.displayName = "SunMoonIcon";
export { SunMoonIcon };
