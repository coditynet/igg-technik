"use client";

import type { Route } from "next";
import { Button } from "./ui/button";
import Link from "next/link";
import { CircleQuestionMark } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popoverTouch";

export function Header() {
	return (
		<div>
			<div className="">
				<h1 className="text-7xl font-bold text-black dark:text-white flex justify-center mt-8">
					IGG TECHNIK
				</h1>
				<h2 className="text-xl font-sans text-black dark:text-white mt-5 flex justify-center">
					Das ist die neue IGG Technik Website. Wenn sie ein Event eintragen wollen, melden Sie sich direkt bei uns in der Technik oder schreiben sie uns an technik@igg.de(ÄNDERN!!!)
            {/* <Tooltip>
						<TooltipTrigger>
							{" "}
							<TooltipContent className="text-md">
								Hilfe
							</TooltipContent>{" "}
							<Popover>
								{" "}
								<div className="inline-flex align-middle ml-2">
									{" "}
									<PopoverTrigger>
										{" "}
										<CircleQuestionMark size={20} />{" "}
									</PopoverTrigger>{" "}
									<PopoverContent className="text-md">
										Mobile Hilfe
									</PopoverContent>{" "}
								</div>{" "}
							</Popover>
						</TooltipTrigger>
					</Tooltip> */}
				</h2>
				<div className="">
						<div className="flex mt-10 justify-center">
					<Link href={"/sign-in" as Route}>
							<Button className="mb-2 cursor-pointer" size={"lg"}>
								Anmelden
							</Button>
					</Link>
						</div>
				</div>
			</div>
		</div>
	);
}
