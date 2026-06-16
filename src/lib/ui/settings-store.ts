export interface UserProfile {
  name: string;
  email: string;
  timezone: string;
  plan: string;
}

export type SignalNotifyType =
  | "pricing"
  | "filing"
  | "insider"
  | "newsletter"
  | "patent"
  | "stock";

export interface SignalNotifyPrefs {
  email: boolean;
  slack: boolean;
  digest: boolean;
}

export interface UserSettings {
  profile: UserProfile;
  emailAlerts: boolean;
  slackAlerts: boolean;
  digest: string;
  signalNotifications: Record<SignalNotifyType, SignalNotifyPrefs>;
  integrations: {
    supabase: boolean;
    slack: boolean;
    discord: boolean;
    supabaseUrl: string;
    supabaseKey: string;
    openaiKey: string;
    slackWebhookUrl: string;
    slackChannel: string;
  };
  display: {
    fontScale: number;
  };
  billing: {
    planPrice: string;
    nextBill: string;
    watchesUsed: number;
    watchesLimit: number;
    signalsMtd: number;
  };
}

const STORAGE_KEY = "vigil-user-settings";

const DEFAULT_SIGNAL_NOTIFICATIONS: Record<SignalNotifyType, SignalNotifyPrefs> = {
  pricing: { email: true, slack: true, digest: true },
  filing: { email: true, slack: false, digest: false },
  insider: { email: true, slack: true, digest: false },
  newsletter: { email: false, slack: false, digest: true },
  patent: { email: true, slack: false, digest: false },
  stock: { email: true, slack: true, digest: true },
};

export const DEFAULT_SETTINGS: UserSettings = {
  profile: {
    name: "Jane Doe",
    email: "demo@vigilant.app",
    timezone: "UTC",
    plan: "Pro",
  },
  emailAlerts: true,
  slackAlerts: false,
  digest: "Daily · 08:00 UTC",
  signalNotifications: DEFAULT_SIGNAL_NOTIFICATIONS,
  integrations: {
    supabase: false,
    slack: false,
    discord: false,
    supabaseUrl: "https://xxxxxxxxxxxx.supabase.co",
    supabaseKey: "••••••••••••••••",
    openaiKey: "••••••••••••••••",
    slackWebhookUrl: "",
    slackChannel: "#competitive-intel",
  },
  display: {
    fontScale: 1.1,
  },
  billing: {
    planPrice: "$49 / month",
    nextBill: "Jul 14, 2026",
    watchesUsed: 3,
    watchesLimit: 10,
    signalsMtd: 12,
  },
};

export function loadSettings(fallbackEmail?: string): UserSettings {
  if (typeof window === "undefined") {
    return {
      ...DEFAULT_SETTINGS,
      profile: {
        ...DEFAULT_SETTINGS.profile,
        email: fallbackEmail ?? DEFAULT_SETTINGS.profile.email,
      },
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_SETTINGS,
        profile: {
          ...DEFAULT_SETTINGS.profile,
          email: fallbackEmail ?? DEFAULT_SETTINGS.profile.email,
        },
      };
    }
    const parsed = JSON.parse(raw) as Partial<UserSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      profile: {
        ...DEFAULT_SETTINGS.profile,
        ...parsed.profile,
        email: fallbackEmail ?? parsed.profile?.email ?? DEFAULT_SETTINGS.profile.email,
      },
      signalNotifications: {
        ...DEFAULT_SIGNAL_NOTIFICATIONS,
        ...parsed.signalNotifications,
      },
      integrations: { ...DEFAULT_SETTINGS.integrations, ...parsed.integrations },
      display: { ...DEFAULT_SETTINGS.display, ...parsed.display },
      billing: { ...DEFAULT_SETTINGS.billing, ...parsed.billing },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export const NOTIFY_SIGNAL_TYPES: { id: SignalNotifyType; label: string }[] = [
  { id: "pricing", label: "PRICING" },
  { id: "filing", label: "FILING" },
  { id: "insider", label: "INSIDER" },
  { id: "newsletter", label: "NEWSLETTER" },
  { id: "patent", label: "PATENT" },
  { id: "stock", label: "STOCK" },
];
