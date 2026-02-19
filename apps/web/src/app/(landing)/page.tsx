import { fullscreenCalendarFlag } from "@/lib/flags";
import { LandingPageContent } from "./_components/landing-page-content";

export default async function Page() {
  const showFullscreenCalendarHero = Boolean(await fullscreenCalendarFlag());
	console.log("showFullscreenCalendarHero", showFullscreenCalendarHero);

	return (
		<LandingPageContent
			showFullscreenCalendarHero={showFullscreenCalendarHero}
		/>
	);
}
