"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User as BetterAuthUser } from "better-auth";
import { User } from "lucide-react";

interface UserAvatarProps {
  user: BetterAuthUser;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={cn("h-8 w-8 rounded-lg", className)}>
      <AvatarImage
        src={
          user.image ||
          `https://avatar.vercel.sh/${user.id}`
        }
        alt={user.name}
      />
      <AvatarFallback className="rounded-lg">
        <User className="size-4" />
      </AvatarFallback>
    </Avatar>
  );
}
