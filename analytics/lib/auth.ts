export function getBasicAuthCredentials(headerValue: string | null): { user: string; password: string } | null {
  if (!headerValue || !headerValue.startsWith('Basic ')) {
    return null;
  }

  try {
    const encoded = headerValue.slice('Basic '.length).trim();
    const decoded = atob(encoded);
    const separatorIndex = decoded.indexOf(':');

    if (separatorIndex === -1) return null;

    return {
      user: decoded.slice(0, separatorIndex),
      password: decoded.slice(separatorIndex + 1)
    };
  } catch {
    return null;
  }
}

export function isAuthorizedAdmin(authHeader: string | null): boolean {
  const credentials = getBasicAuthCredentials(authHeader);

  if (!credentials) return false;

  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    return false;
  }

  return credentials.user === adminUser && credentials.password === adminPassword;
}