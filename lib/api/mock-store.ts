import type { AutomatedGreetingSettings } from "./types";

/**
 * The rest of the app talks to the live el-moore-api backend directly — this file only
 * backs the automated-greeting toggle previews on the Newsletter page, since there's no
 * endpoint yet to configure those triggers server-side.
 */
export const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const automatedGreetingSettings: AutomatedGreetingSettings = {
  birthday: true,
  paymentReminder: true,
  inspectionFollowup: false,
};
