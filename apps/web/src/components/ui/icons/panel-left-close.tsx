"use client";

import { cn } from "@/lib/utils";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface PanelLeftCloseIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface PanelLeftCloseIconProps extends HTMLMotionProps<"div"> {
	size?: number;
	duration?: number;
	isAnimated?: boolean;
}

const PanelLeftCloseIcon = forwardRef<
	PanelLeftCloseIconHandle,
	PanelLeftCloseIconProps
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

		const rectVariants: Variants = {
			normal: {},
			animate: {},
		};

		const lineVariants: Variants = {
			normal: { x1: 9, y1: 3, x2: 9, y2: 21 },
			animate: {
				x1: 7,
				y1: 3,
				x2: 7,
				y2: 21,
				transition: {
					type: "spring",
					damping: 18,
					stiffness: 200,
					duration: duration * 0.8,
				},
			},
		};

		const arrowVariants: Variants = {
			normal: { x: 0 },
			animate: {
				x: -2,
				transition: {
					type: "spring",
					damping: 18,
					stiffness: 200,
					duration: duration * 0.8,
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
					animate={controls}
					initial="normal"
				>
					<motion.rect
						width={18}
						height={18}
						x={3}
						y={3}
						rx={2}
						ry={2}
						variants={rectVariants}
					/>
					<motion.line
						x1={9}
						y1={3}
						x2={9}
						y2={21}
						variants={lineVariants}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="m16 15-3-3 3-3"
						variants={arrowVariants}
						initial="normal"
						animate={controls}
					/>
				</motion.svg>
			</motion.div>
		);
	},
);

PanelLeftCloseIcon.displayName = "PanelLeftCloseIcon";
export { PanelLeftCloseIcon };
