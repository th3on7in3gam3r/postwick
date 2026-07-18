export function appUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3002").replace(
    /\/$/,
    "",
  );
}

export function kerygmaUrl() {
  return (
    process.env.NEXT_PUBLIC_KERYGMA_URL ?? "https://kerygmasocial.com"
  ).replace(/\/$/, "");
}

export function supportEmail() {
  return (
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() ||
    "support@kerygmasocial.com"
  );
}

/** Cadence Settings — Growth stack API keys live here. */
export function cadenceSettingsUrl() {
  return (
    process.env.NEXT_PUBLIC_CADENCE_SETTINGS_URL?.trim().replace(/\/$/, "") ||
    "https://cadence.biblefunland.com/app/settings"
  );
}
