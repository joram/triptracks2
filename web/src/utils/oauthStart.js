/** Hosted OAuth start URL for preview (VeilStream auth broker). Disabled when unset. */
export function externalOAuthStartUrl(provider = 'google') {
  const startBase = process.env.REACT_APP_VEILSTREAM_AUTH_BROKER_URL?.replace(/\/$/, '');
  if (!startBase) {
    return null;
  }

  const callbackPath = process.env.REACT_APP_OAUTH_CALLBACK_PATH || '/auth/callback';
  const callbackUrl = `${window.location.origin.replace(/\/$/, '')}${callbackPath}`;

  const params = new URLSearchParams({ callback_url: callbackUrl });

  const projectId = process.env.REACT_APP_VEILSTREAM_PROJECT_ID;
  const environmentId = process.env.REACT_APP_ENVIRONMENT_NAME;
  if (projectId) {
    params.set('project_id', projectId);
  }
  if (environmentId) {
    params.set('environment_id', environmentId);
  }

  return `${startBase}/auth/start/${provider}?${params}`;
}
