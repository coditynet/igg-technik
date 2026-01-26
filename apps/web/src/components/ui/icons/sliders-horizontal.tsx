"use client";

import { cn } from "@/lib/utils";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface SlidersHorizontalIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface SlidersHorizontalIconProps extends HTMLMotionProps<"div"> {
	size?: number;
	duration?: number;
	isAnimated?: boolean;
}

const SlidersHorizontalIcon = forwardRef<
	SlidersHorizontalIconHandle,
	SlidersHorizontalIconProps
>(
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
			(e?: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlled.current) controls.start("normal");
				else onMouseLeave?.(e as any);
			},
			[controls, onMouseLeave],
		);

		const sliderTransition = {
			type: "spring",
			stiffness: 100,
			damping: 12,
			mass: 0.4,
		};

		const line1Variants: Variants = {
			normal: { x2: 14 },
			animate: { x2: 10, transition: sliderTransition },
		};

		const line2Variants: Variants = {
			normal: { x1: 10 },
			animate: { x1: 5, transition: sliderTransition },
		};

		const line3Variants: Variants = {
			normal: { x2: 12 },
			animate: { x2: 18, transition: sliderTransition },
		};

		const line4Variants: Variants = {
			normal: { x1: 8 },
			animate: { x1: 13, transition: sliderTransition },
		};

		const line5Variants: Variants = {
			normal: { x2: 12 },
			animate: { x2: 4, transition: sliderTransition },
		};

		const line6Variants: Variants = {
			normal: { x1: 16 },
			animate: { x1: 8, transition: sliderTransition },
		};

		const handle1Variants: Variants = {
			normal: { x1: 14, x2: 14 },
			animate: { x1: 9, x2: 9, transition: sliderTransition },
		};

		const handle2Variants: Variants = {
			normal: { x1: 8, x2: 8 },
			animate: { x1: 14, x2: 14, transition: sliderTransition },
		};

		const handle3Variants: Variants = {
			normal: { x1: 16, x2: 16 },
			animate: { x1: 8, x2: 8, transition: sliderTransition },
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
					<motion.line
						x1={21}
						x2={14}
						y1={4}
						y2={4}
						variants={line1Variants}
						initial="normal"
						animate={controls}
					/>
					<motion.line
						x1={10}
						x2={3}
						y1={4}
						y2={4}
						variants={line2Variants}
						initial="normal"
						animate={controls}
					/>
					<motion.line
						x1={21}
						x2={12}
						y1={12}
						y2={12}
						variants={line3Variants}
						initial="normal"
						animate={controls}
					/>
					<motion.line
						x1={8}
						x2={3}
						y1={12}
						y2={12}
						variants={line4Variants}
						initial="normal"
						animate={controls}
					/>
					<motion.line
						x1={3}
						x2={12}
						y1={20}
						y2={20}
						variants={line5Variants}
						initial="normal"
						animate={controls}
					/>
					<motion.line
						x1={16}
						x2={21}
						y1={20}
						y2={20}
						variants={line6Variants}
						initial="normal"
						animate={controls}
					/>
					<motion.line
						x1={14}
						x2={14}
						y1={2}
						y2={6}
						variants={handle1Variants}
						initial="normal"
						animate={controls}
					/>
					<motion.line
						x1={8}
						x2={8}
						y1={10}
						y2={14}
						variants={handle2Variants}
						initial="normal"
						animate={controls}
					/>
					<motion.line
						x1={16}
						x2={16}
						y1={18}
						y2={22}
						variants={handle3Variants}
						initial="normal"
						animate={controls}
					/>
				</motion.svg>
			</motion.div>
		);
	},
);

SlidersHorizontalIcon.displayName = "SlidersHorizontalIcon";
export { SlidersHorizontalIcon };
