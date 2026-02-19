import { getToken } from "@/lib/auth-server";
import { vercelAdapter } from '@flags-sdk/vercel';
import { dedupe, flag } from 'flags/next';

type FlagEntities = {
  user?: {
    id: string;
    email?: string;
  };
};

type JwtClaims = {
  sub?: string;
  email?: string;
};

function decodeJwtClaims(token: string): JwtClaims | undefined {
  const [, payload] = token.split(".");
  if (!payload) return undefined;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(decoded) as JwtClaims;
  } catch {
    return undefined;
  }
}

const identify = dedupe(async (): Promise<FlagEntities> => {
  const token = await getToken();
  if (!token) return {};

  const claims = decodeJwtClaims(token);
  if (!claims?.sub) return {};
  return {
    user: {
      id: claims.sub,
      email: claims.email,
    },
  };
});

export const fullscreenCalendarFlag = flag<boolean, FlagEntities>({
  key: 'fullscreen-calendar',
  adapter: vercelAdapter(),
  identify,
});
