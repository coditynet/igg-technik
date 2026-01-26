"use client";

import { cn } from "@/lib/utils";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface FingerprintIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface FingerprintIconProps extends HTMLMotionProps<"div"> {
	size?: number;
	duration?: number;
	isAnimated?: boolean;
}

const FingerprintIcon = forwardRef<FingerprintIconHandle, FingerprintIconProps>(
	(
		{
			onMouseEnter,
			onMouseLeave,
			className,
			size = 24,
			duration = 1.5,
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
			(e?: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlled.current) controls.start("normal");
				else onMouseLeave?.(e as any);
			},
			[controls, onMouseLeave],
		);

		const groupVariants: Variants = {
			normal: { scale: 1 },
			animate: {
				scale: [1, 1.1, 1],
				transition: {
					ease: "easeInOut",
					duration: duration,
				},
			},
		};

		const basePathVariants: Variants = {
			normal: { strokeOpacity: 0.2 },
			animate: { strokeOpacity: 0.2 },
		};

		const pathVariants: Variants = {
			normal: { pathLength: 1 },
			animate: {
				pathLength: [1, 0.05, 1],
				transition: {
					pathLength: { duration: duration, ease: "easeInOut" },
				},
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
					variants={groupVariants}
					initial="normal"
					animate={controls}
				>
					<motion.path
						stroke="currentColor"
						variants={basePathVariants}
						initial="normal"
						animate={controls}
						d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4 M14 13.12c0 2.38 0 6.38-1 8.88 M17.29 21.02c.12-.6.43-2.3.5-3.02 M2 12a10 10 0 0 1 18-6 M2 16h.01 M21.8 16c.2-2 .131-5.354 0-6 M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2 M8.65 22c.21-.66.45-1.32.57-2 M9 6.8a6 6 0 0 1 9 5.2v2"
					/>
					<motion.path
						d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"
						variants={pathVariants}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M14 13.12c0 2.38 0 6.38-1 8.88"
						variants={pathVariants}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M17.29 21.02c.12-.6.43-2.3.5-3.02"
						variants={pathVariants}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M2 12a10 10 0 0 1 18-6"
						variants={pathVariants}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M2 16h.01"
						variants={pathVariants}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M21.8 16c.2-2 .131-5.354 0-6"
						variants={pathVariants}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"
						variants={pathVariants}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M8.65 22c.21-.66.45-1.32.57-2"
						variants={pathVariants}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M9 6.8a6 6 0 0 1 9 5.2v2"
						variants={pathVariants}
						initial="normal"
						animate={controls}
					/>
				</motion.svg>
			</motion.div>
		);
	},
);

FingerprintIcon.displayName = "FingerprintIcon";
export { FingerprintIcon };
