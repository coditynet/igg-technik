"use client";

import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MailIconHandle {
	startAnimation: () => void;
	stopAnimation: () => void;
}

interface MailIconProps extends HTMLMotionProps<"div"> {
	size?: number;
	duration?: number;
	isAnimated?: boolean;
}

const MailIcon = forwardRef<MailIconHandle, MailIconProps>(
	(
		{
			onMouseEnter,
			onMouseLeave,
			className,
			size = 24,
			duration = 1,
			isAnimated = true,
			...props
		},
		ref,
	) => {
		const flapControls = useAnimation();
		const bodyControls = useAnimation();
		const containerControls = useAnimation();
		const reduced = useReducedMotion();
		const isControlled = useRef(false);

		useImperativeHandle(ref, () => {
			isControlled.current = true;
			return {
				startAnimation: () => {
					if (reduced) {
						containerControls.start("normal");
						flapControls.start("normal");
						bodyControls.start("normal");
					} else {
						containerControls.start("animate");
						flapControls.start("animate");
						bodyControls.start("animate");
					}
				},
				stopAnimation: () => {
					containerControls.start("normal");
					flapControls.start("normal");
					bodyControls.start("normal");
				},
			};
		});

		const handleEnter = useCallback(
			(e?: React.MouseEvent<HTMLDivElement>) => {
				if (!isAnimated || reduced) return;
				if (!isControlled.current) {
					containerControls.start("animate");
					flapControls.start("animate");
					bodyControls.start("animate");
				} else onMouseEnter?.(e as any);
			},
			[
				containerControls,
				flapControls,
				bodyControls,
				reduced,
				onMouseEnter,
				isAnimated,
			],
		);

		const handleLeave = useCallback(
			(e?: React.MouseEvent<HTMLDivElement>) => {
				if (!isControlled.current) {
					containerControls.start("normal");
					flapControls.start("normal");
					bodyControls.start("normal");
				} else onMouseLeave?.(e as any);
			},
			[containerControls, flapControls, bodyControls, onMouseLeave],
		);

		const containerVariants: Variants = {
			normal: {
				scale: 1,
				y: 0,
				rotate: 0,
			},
			animate: {
				scale: [1, 1.08, 0.96, 1.02, 1],
				y: [0, -3, 1, -0.5, 0],
				rotate: [0, -1, 1, -0.5, 0],
				transition: {
					duration: 0.7 * duration,
					ease: "easeOut",
					times: [0, 0.3, 0.6, 0.85, 1],
				},
			},
		};

		const flapVariants: Variants = {
			normal: { rotateX: 0, translateY: 0, transformOrigin: "12px 6px" },
			animate: {
				rotateX: [0, -20, 5, -2, 0],
				translateY: [0, -2.5, 1, -0.3, 0],
				transition: {
					duration: 0.65 * duration,
					ease: "easeOut",
					times: [0, 0.35, 0.65, 0.85, 1],
				},
			},
		};

		const bodyVariants: Variants = {
			normal: {
				opacity: 1,
				scale: 1,
			},
			animate: {
				opacity: [1, 0.92, 1, 0.98, 1],
				scale: [1, 0.98, 1.02, 0.99, 1],
				transition: {
					duration: 0.65 * duration,
					ease: "easeOut",
					times: [0, 0.25, 0.55, 0.8, 1],
				},
			},
		};

		return (
			<motion.div
				className={cn("inline-flex items-center justify-center", className)}
				onMouseEnter={handleEnter}
				onMouseLeave={handleLeave}
				{...props}
				initial="normal"
				animate={containerControls}
				variants={containerVariants}
				role="img"
				aria-label="Mail"
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
					<title>Mail</title>
					<motion.path
						d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"
						initial="normal"
						animate={flapControls}
						variants={flapVariants}
						style={{ transformStyle: "preserve-3d" }}
					/>
					<motion.rect
						x="2"
						y="4"
						width="20"
						height="16"
						rx="2"
						initial="normal"
						animate={bodyControls}
						variants={bodyVariants}
					/>
				</svg>
			</motion.div>
		);
	},
);

MailIcon.displayName = "MailIcon";
export { MailIcon };
