/** Shape stored in `users.settings` and mirrored in localStorage for the settings UI. */
export type AppSettingsState = {
  emailNotif: boolean;
  imAlerts: boolean;
  weekly: boolean;
  investingDigest: boolean;
  dealPromo: boolean;
  dealEvents: boolean;
  dealProducts: boolean;
  locationRadius: string;
  minPayout: string;
  investingLevel: "beginner" | "intermediate" | "advanced";
  risk: "low" | "medium" | "high";
};

export const DEFAULT_APP_SETTINGS: AppSettingsState = {
  emailNotif: true,
  imAlerts: true,
  weekly: true,
  investingDigest: true,
  dealPromo: true,
  dealEvents: true,
  dealProducts: true,
  locationRadius: "50",
  minPayout: "100",
  investingLevel: "beginner",
  risk: "medium",
};

export function mergeAppSettingsFromDb(raw: unknown): AppSettingsState {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_APP_SETTINGS };
  return { ...DEFAULT_APP_SETTINGS, ...(raw as Partial<AppSettingsState>) };
}
