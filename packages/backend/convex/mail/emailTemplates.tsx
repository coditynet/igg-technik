// IMPORTANT: this is a Convex Node Action
"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { render } from "@react-email/render";
import EventConfirmationSuccess from "@igg/email/src/event-confirmation-success.js";
import EventConfirmationMissingData from "@igg/email/src/event-confirmation-missing-data.js";
import EventConfirmationFailed from "@igg/email/src/event-confirmation-failed.js";
import * as React from "react";

/**
 * Render success email template (all fields present)
 */
export const renderSuccessEmail = internalAction({
	args: {
		eventUrl: v.string(),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		location: v.optional(v.string()),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const html = await render(
			React.createElement(EventConfirmationSuccess, args),
		);
		return html;
	},
});

/**
 * Render missing data email template (some fields missing)
 */
export const renderMissingDataEmail = internalAction({
	args: {
		eventUrl: v.string(),
		title: v.optional(v.string()),
		description: v.optional(v.string()),
		location: v.optional(v.string()),
		startDate: v.optional(v.string()),
		endDate: v.optional(v.string()),
		missingFields: v.array(v.string()),
	},
	handler: async (ctx, args) => {
		const html = await render(
			React.createElement(EventConfirmationMissingData, args),
		);
		return html;
	},
});

/**
 * Render failed email template (AI extraction failed)
 */
export const renderFailedEmail = internalAction({
	args: {
		eventUrl: v.string(),
		errorMessage: v.string(),
	},
	handler: async (ctx, args) => {
		const html = await render(
			React.createElement(EventConfirmationFailed, args),
		);
		return html;
	},
});
