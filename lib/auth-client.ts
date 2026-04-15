import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

const getBaseURL = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  return "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  plugins: [adminClient()],
});
