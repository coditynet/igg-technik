"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface CalendarIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface CalendarIconProps extends HTMLAttributes<HTMLDivElement> {
	size?: number;
}

const RECT_VARIANTS: Variants = {
	normal: {
		scale: 1,
		rotate: 0,
		y: 0,
		transition: {
			duration: 0.4,
			ease: "easeOut",
		},
	},
	animate: {
		scale: [1, 0.92, 1.05, 0.98, 1.02, 1],
		rotate: [0, -2, 2, -1, 1, 0],
		y: [0, -2, 1, 0],
		transition: {
			duration: 0.8,
			ease: "easeInOut",
		},
	},
};

const TOP_LINE_VARIANTS: Variants = {
	normal: {
		pathLength: 1,
		opacity: 1,
		scaleX: 1,
		transition: {
			duration: 0.3,
		},
	},
	animate: {
		pathLength: [0, 1, 1, 1],
		opacity: [0, 1, 1, 1],
		scaleX: [0.8, 1.1, 0.95, 1],
		transition: {
			duration: 0.7,
			delay: 0.15,
			ease: "easeOut",
		},
	},
};

const POST_VARIANTS: Variants = {
	normal: {
		y: 0,
		scaleY: 1,
		transition: {
			duration: 0.35,
			ease: "easeOut",
		},
	},
	animate: (i: number) => ({
		y: [-5, 2, 0],
		scaleY: [1, 0.85, 1.15, 1],
		transition: {
			duration: 0.6,
			delay: i * 0.08,
			ease: "easeOut",
		},
	}),
};

const CalendarIcon = forwardRef<CalendarIconHandle, CalendarIconProps>(
	({ className, size = 28, ...props }, ref) => {
		const controls = useAnimation();
		const isControlledRef = useRef(false);

		useImperativeHandle(ref, () => {
			isControlledRef.current = true;

			return {
				startAnimation: () => controls.start("animate"),
				stopAnimation: () => controls.start("normal"),
			};
		});

		const handleMouseEnter = useCallback(() => {
			if (!isControlledRef.current) {
				controls.start("animate");
			}
		}, [controls]);

		const handleMouseLeave = useCallback(() => {
			if (!isControlledRef.current) {
				controls.start("normal");
			}
		}, [controls]);

		return (
			<div
				className={cn(className)}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				role="img"
				aria-label="Calendar"
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
					<title>Calendar</title>
					<motion.path
						d="M8 2v4"
						variants={POST_VARIANTS}
						animate={controls}
						custom={0}
					/>
					<motion.path
						d="M16 2v4"
						variants={POST_VARIANTS}
						animate={controls}
						custom={1}
					/>
					<motion.rect
						width="18"
						height="18"
						x="3"
						y="4"
						rx="2"
						variants={RECT_VARIANTS}
						animate={controls}
					/>
					<motion.path
						d="M3 10h18"
						variants={TOP_LINE_VARIANTS}
						animate={controls}
					/>
				</svg>
			</div>
		);
	},
);

CalendarIcon.displayName = "CalendarIcon";

export { CalendarIcon };
