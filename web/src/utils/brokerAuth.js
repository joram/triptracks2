/** VeilStream auth broker start URL (preview OAuth). Returns null when broker is disabled. */
export function brokerLoginUrl(provider = 'google') {
  const broker = process.env.REACT_APP_VEILSTREAM_AUTH_BROKER_URL?.replace(/\/$/, '');
  if (!broker) {
    return null;
  }

  const callbackPath = process.env.REACT_APP_OAUTH_CALLBACK_PATH || '/auth/callback';
  const callbackUrl = `${window.location.origin.replace(/\/$/, '')}${callbackPath}`;

  const params = new URLSearchParams({ callback_url: callbackUrl });

  // Optional overrides; when omitted the broker resolves project/environment from callback_url
  // against the allowlist (preview hostname is the source of truth).
  const projectId = process.env.REACT_APP_VEILSTREAM_PROJECT_ID;
  const environmentId = process.env.REACT_APP_ENVIRONMENT_NAME;
  if (projectId) {
    params.set('project_id', projectId);
  }
  if (environmentId) {
    params.set('environment_id', environmentId);
  }

  return `${broker}/auth/start/${provider}?${params}`;
}

export function authBrokerEnabled() {
  return Boolean(process.env.REACT_APP_VEILSTREAM_AUTH_BROKER_URL?.replace(/\/$/, ''));
}
