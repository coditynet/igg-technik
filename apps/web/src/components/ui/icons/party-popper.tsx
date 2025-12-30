"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface PartyPopperIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface PartyPopperIconProps extends HTMLAttributes<HTMLDivElement> {
	size?: number;
}

const POPPER_PATH_VARIANTS: Variants = {
	normal: {
		opacity: 1,
		pathLength: 1,
		pathOffset: 0,
		scale: 1,
		x: 0,
		y: 0,
	},
	animate: {
		opacity: [0, 0, 0, 1, 1],
		scale: [0.3, 0.8, 1, 1.1, 1],
		pathLength: [0, 0.5, 1],
		pathOffset: [1, 0.5, 0],
		x: [-5, 0],
		y: [5, 0],
		transition: {
			duration: 0.6,
			ease: "easeInOut",
		},
	},
};

const GROUP_VARIANTS: Variants = {
	normal: {
		x: 0,
		y: 0,
		scale: 1,
	},
	animate: {
		x: [-1, 1, 0],
		y: [1, -1, 0],
		scale: [1, 0.7, 1.1, 1],
		transition: {
			duration: 0.6,
			ease: "easeInOut",
		},
	},
};

const CONFETTI_VARIANTS: Variants = {
	normal: { opacity: 1, scale: 1, x: 0, y: 0 },
	animate: {
		opacity: [0, 0, 0, 1, 1],
		x: [-5, 0],
		y: [5, 0],
		scale: [0.5, 1, 1.2, 1],
		transition: {
			duration: 0.6,
		},
	},
};

const CONFETTI_FAR_VARIANTS: Variants = {
	normal: { opacity: 1, scale: 1, x: 0, y: 0 },
	animate: {
		opacity: [0, 0, 0, 1, 1],
		x: [-10, 0],
		y: [10, 0],
		scale: [0.5, 1, 1.2, 1],
		transition: {
			duration: 0.6,
		},
	},
};

const PartyPopperIcon = forwardRef<PartyPopperIconHandle, PartyPopperIconProps>(
	({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
		const controls = useAnimation();
		const isControlledRef = useRef(false);

		useImperativeHandle(ref, () => {
			isControlledRef.current = true;

			return {
				startAnimation: () => controls.start("animate"),
				stopAnimation: () => controls.start("normal"),
			};
		});

		const handleMouseEnter = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlledRef.current) {
					controls.start("animate");
				} else {
					onMouseEnter?.(e);
				}
			},
			[controls, onMouseEnter],
		);

		const handleMouseLeave = useCallback(
			(e: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlledRef.current) {
					controls.start("normal");
				} else {
					onMouseLeave?.(e);
				}
			},
			[controls, onMouseLeave],
		);

		return (
			<div
				className={cn(className)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				role="img"
				aria-label="Party Popper"
				{...props}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width={size}
					height={size}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title>Party Popper</title>
					<motion.g
						variants={GROUP_VARIANTS}
						initial="normal"
						animate={controls}
					>
						<motion.path d="M5.8 11.3 2 22l10.7-3.79" />
						<motion.path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
					</motion.g>
					<motion.path
						d="M4 3h.01"
						variants={CONFETTI_VARIANTS}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M22 8h.01"
						variants={CONFETTI_FAR_VARIANTS}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M15 2h.01"
						variants={CONFETTI_FAR_VARIANTS}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="M22 20h.01"
						variants={CONFETTI_VARIANTS}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"
						variants={POPPER_PATH_VARIANTS}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"
						variants={POPPER_PATH_VARIANTS}
						initial="normal"
						animate={controls}
					/>
					<motion.path
						d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"
						variants={POPPER_PATH_VARIANTS}
						initial="normal"
						animate={controls}
					/>
				</svg>
			</div>
		);
	},
);

PartyPopperIcon.displayName = "PartyPopperIcon";

export { PartyPopperIcon };
