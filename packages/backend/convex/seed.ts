import { mutation } from "./_generated/server";

export const seedData = mutation({
	args: {},
	handler: async (ctx) => {
		const existingGroups = await ctx.db.query("groups").collect();
		if (existingGroups.length > 0) {
			return { success: false, message: "Database already seeded" };
		}

		const group1Id = await ctx.db.insert("groups", {
			name: "Group 1",
			color: "emerald",
		});

		const group2Id = await ctx.db.insert("groups", {
			name: "Group 2",
			color: "blue",
		});

		const group3Id = await ctx.db.insert("groups", {
			name: "Group 3",
			color: "orange",
		});

		const getDaysUntilNextSunday = (date: Date) => {
			const day = date.getDay();
			return day === 0 ? 0 : 7 - day;
		};

		const currentDate = new Date();
		const daysUntilNextSunday = getDaysUntilNextSunday(currentDate);

		const createDate = (dayOffset: number, hour: number, minute: number) => {
			const date = new Date(currentDate);
			date.setDate(date.getDate() + dayOffset + daysUntilNextSunday);
			date.setHours(hour, minute, 0, 0);
			return date.getTime();
		};

		await ctx.db.insert("events", {
			title: "Event 1",
			description: "Description 1",
			start: createDate(-6, 9, 0),
			end: createDate(-6, 10, 30),
			groupId: group1Id,
			location: "Conference Room A",
			allDay: false,
		});

		await ctx.db.insert("events", {
			title: "Event 2",
			description: "Description 2",
			start: createDate(-3, 14, 0),
			end: createDate(-3, 16, 0),
			groupId: group1Id,
			location: "Workshop Space",
			allDay: false,
		});

		await ctx.db.insert("events", {
			title: "Event 3",
			description: "Description 3",
			start: createDate(-5, 10, 0),
			end: createDate(-5, 11, 0),
			groupId: group2Id,
			location: "Meeting Room B",
			allDay: false,
		});

		await ctx.db.insert("events", {
			title: "Event 4",
			description: "Description 4",
			start: createDate(-2, 13, 0),
			end: createDate(-2, 15, 0),
			groupId: group2Id,
			location: "Conference Room C",
			allDay: false,
		});

		await ctx.db.insert("events", {
			title: "Event 5",
			description: "Description 5",
			start: createDate(-4, 11, 0),
			end: createDate(-4, 12, 30),
			groupId: group3Id,
			location: "Planning Room",
			allDay: false,
		});

		await ctx.db.insert("events", {
			title: "Event 6",
			description: "Description 6",
			start: createDate(-1, 9, 0),
			end: createDate(-1, 10, 0),
			groupId: group3Id,
			location: "Team Area",
			allDay: false,
		});

		return {
			success: true,
			message: "Database seeded successfully with 3 groups and 6 events",
		};
	},
});

export const clearData = mutation({
	args: {},
	handler: async (ctx) => {
		const events = await ctx.db.query("events").collect();
		for (const event of events) {
			await ctx.db.delete(event._id);
		}

		const groups = await ctx.db.query("groups").collect();
		for (const group of groups) {
			await ctx.db.delete(group._id);
		}

		return {
			success: true,
			message: "Database cleared successfully",
		};
	},
});
