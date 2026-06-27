/** VeilStream auth broker start URL (preview OAuth). Returns null when broker is disabled. */
export function brokerLoginUrl(provider = 'google') {
  const broker = process.env.REACT_APP_VEILSTREAM_AUTH_BROKER_URL?.replace(/\/$/, '');
  if (!broker) {
    return null;
  }

  const projectId = process.env.REACT_APP_VEILSTREAM_PROJECT_ID;
  const environmentId = process.env.REACT_APP_ENVIRONMENT_NAME;
  if (!projectId || !environmentId) {
    console.error('REACT_APP_VEILSTREAM_PROJECT_ID and REACT_APP_ENVIRONMENT_NAME are required for broker login');
    return null;
  }

  const publicUrl = (process.env.REACT_APP_PUBLIC_URL || window.location.origin).replace(/\/$/, '');
  const callbackPath = process.env.REACT_APP_OAUTH_CALLBACK_PATH || '/auth/callback';
  const params = new URLSearchParams({
    project_id: projectId,
    environment_id: environmentId,
    callback_url: `${publicUrl}${callbackPath}`,
  });
  return `${broker}/auth/start/${provider}?${params}`;
}

export function authBrokerEnabled() {
  return Boolean(process.env.REACT_APP_VEILSTREAM_AUTH_BROKER_URL?.replace(/\/$/, ''));
}
