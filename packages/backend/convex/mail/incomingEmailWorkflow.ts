import { v } from "convex/values";
import { internal } from "../_generated/api";
import { workflow } from "../workflow";
import { internalMutation } from "../_generated/server";

// Inline the result validator since @convex-dev/workpool is a peer dependency
const vRunResult = v.union(
	v.object({ kind: v.literal("success"), returnValue: v.any() }),
	v.object({ kind: v.literal("failed"), error: v.string() }),
	v.object({ kind: v.literal("canceled") }),
);

/**
 * Robust email processing workflow with AI retry logic
 *
 * Flow:
 * 1. Email received -> Workflow starts
 * 2. Fetch and save email to DB (3 retries)
 * 3. Create empty email registration
 * 4. Try AI extraction (2 attempts with workflow-managed retries)
 * 5. Update registration with AI data (if successful)
 * 6. Send confirmation email based on state (missing/full/error)
 */
export const processIncomingEmail = workflow.define({
	args: {
		emailId: v.string(),
	},
	handler: async (step, args): Promise<void> => {
		// Step 1: Fetch email from Resend and save to database (with 3 retries)
		const emailRecordId = await step.runAction(
			internal.mail.processEmail.fetchAndSaveEmail,
			{
				emailId: args.emailId,
			},
			{
				name: "Fetch and Save Email",
				retry: {
					maxAttempts: 3,
					initialBackoffMs: 1000,
					base: 2,
				},
			},
		);

		// Step 2: Create empty registration immediately
		const emailRegistrationId = await step.runMutation(
			internal.mail.processEmail.createEmptyRegistration,
			{
				emailRecordId: emailRecordId as any,
			},
			{ name: "Create Empty Registration" },
		);

		// Step 3: Get email text for AI processing
		const email = await step.runQuery(
			internal.mail.processEmail.getEmail,
			{
				emailId: emailRecordId as any,
			},
			{ name: "Get Email Data" },
		);

		if (!email || !email.text) {
			// No text content - send failure email
			await step.runAction(
				internal.mail.processEmail.sendConfirmationEmail,
				{
					emailRegistrationId: emailRegistrationId as any,
					aiFailed: true,
					errorMessage: "Email has no text content to process",
				},
				{ name: "Send Failure Email (No Text)" },
			);
			return;
		}

		// Step 4: Try AI extraction (2 attempts with workflow-managed retries)
		// Use try-catch to allow workflow to continue even if AI fails
		let aiSuccess = false;
		let aiResult = null;

		try {
			aiResult = await step.runAction(
				internal.ai.email.extractEventData,
				{
					emailText: email.text,
				},
				{
					name: "AI Extraction",
					retry: {
						maxAttempts: 2, // Workflow handles 2 attempts automatically
						initialBackoffMs: 2000,
						base: 2,
					},
				},
			);
			aiSuccess = true;
		} catch (error) {
			console.error("AI extraction failed after 2 attempts:", error);
			// Continue to send email - user will get "AI failed" notification
		}

		// Step 5: Update registration with AI data (if AI succeeded)
		if (aiSuccess && aiResult) {
			await step.runMutation(
				internal.mail.processEmail.updateRegistrationWithAI,
				{
					emailRegistrationId: emailRegistrationId as any,
					...aiResult,
				},
				{ name: "Update Registration with AI Data" },
			);
		}

		// Step 6: Always send confirmation email based on state
		await step.runAction(
			internal.mail.processEmail.sendConfirmationEmail,
			{
				emailRegistrationId: emailRegistrationId as any,
				aiFailed: !aiSuccess,
				errorMessage: aiSuccess
					? undefined
					: "Failed to extract event details after 2 attempts",
			},
			{
				name: "Send Confirmation Email",
				retry: {
					maxAttempts: 3, // Retry sending email 3 times
					initialBackoffMs: 2000,
					base: 2,
				},
			},
		);
	},
});

/**
 * Handle workflow completion (success, error, or cancellation)
 * This catches any workflow failures and logs them for admin review
 */
export const handleWorkflowComplete = internalMutation({
	args: {
		workflowId: v.string(),
		result: vRunResult,
		context: v.object({
			emailId: v.string(),
		}),
	},
	handler: async (ctx, args) => {
		if (args.result.kind === "failed") {
			// Workflow failed - log for admin review
			console.error("Email workflow failed:", {
				workflowId: args.workflowId,
				emailId: args.context.emailId,
				error: args.result.error,
			});

			// TODO: Log to admin dashboard table for monitoring
			// await ctx.db.insert("failedEmailWorkflows", {
			//   workflowId: args.workflowId,
			//   emailId: args.context.emailId,
			//   error: args.result.error,
			//   timestamp: Date.now(),
			// });
		} else if (args.result.kind === "success") {
			console.log("Email workflow completed successfully:", {
				workflowId: args.workflowId,
				emailId: args.context.emailId,
			});
		} else if (args.result.kind === "canceled") {
			console.log("Email workflow was canceled:", {
				workflowId: args.workflowId,
				emailId: args.context.emailId,
			});
		}
	},
});
