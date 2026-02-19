import { vercelAdapter } from '@flags-sdk/vercel';
import { flag } from 'flags/next';

export const fullscreenCalendarFlag = flag({
  key: 'fullscreen-calendar',
  adapter: vercelAdapter(),
});
