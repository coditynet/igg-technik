"use client";

import React, {
	createContext,
	type ReactNode,
	useContext,
	useState,
} from "react";
import type { CalendarGroup, EventColor } from "@/components/event-calendar";

interface CalendarContextType {
	// Date management
	currentDate: Date;
	setCurrentDate: (date: Date) => void;

	// Group visibility management
	visibleGroupIds: string[];
	toggleGroupVisibility: (groupId: string) => void;
	isGroupVisible: (groupId: string | undefined) => boolean;

	// Get color for a groupId
	getGroupColor: (groupId: string | undefined) => EventColor | undefined;
	getGroup: (groupId: string | undefined) => CalendarGroup | undefined;
	getAllGroups: () => CalendarGroup[];
}

const CalendarContext = createContext<CalendarContextType | undefined>(
	undefined,
);

export function useCalendarContext() {
	const context = useContext(CalendarContext);
	if (context === undefined) {
		throw new Error(
			"useCalendarContext must be used within a CalendarProvider",
		);
	}
	return context;
}

interface CalendarProviderProps {
	children: ReactNode;
	groups: CalendarGroup[];
}

export function CalendarProvider({ children, groups }: CalendarProviderProps) {
	const [currentDate, setCurrentDate] = useState<Date>(new Date());

	// Initialize visibleGroupIds based on the isActive property in groups
	const [visibleGroupIds, setVisibleGroupIds] = useState<string[]>(() => {
		return groups.filter((group) => group.isActive).map((group) => group.id);
	});

	// Toggle visibility of a group
	const toggleGroupVisibility = (groupId: string) => {
		setVisibleGroupIds((prev) => {
			if (prev.includes(groupId)) {
				return prev.filter((id) => id !== groupId);
			}
			return [...prev, groupId];
		});
	};

	// Check if a group is visible
	const isGroupVisible = (groupId: string | undefined) => {
		if (!groupId) return true; // Events without a groupId are always visible
		return visibleGroupIds.includes(groupId);
	};

	// Get the color for a groupId
	const getGroupColor = (
		groupId: string | undefined,
	): EventColor | undefined => {
		if (!groupId) return undefined;
		const group = groups.find((g) => g.id === groupId);
		return group?.color;
	};

	// Get the full group object
	const getGroup = (groupId: string | undefined): CalendarGroup | undefined => {
		if (!groupId) return undefined;
		return groups.find((g) => g.id === groupId);
	};

	// Get all groups
	const getAllGroups = (): CalendarGroup[] => {
		return groups;
	};

	const value = {
		currentDate,
		setCurrentDate,
		visibleGroupIds,
		toggleGroupVisibility,
		isGroupVisible,
		getGroupColor,
		getGroup,
		getAllGroups,
	};

	return (
		<CalendarContext.Provider value={value}>
			{children}
		</CalendarContext.Provider>
	);
}
