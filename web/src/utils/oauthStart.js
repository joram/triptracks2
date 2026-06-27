/** Preview OAuth issuer (VeilStream auth router). Disabled when unset. */
function oauthIssuer() {
  return (
    process.env.REACT_APP_OAUTH_ISSUER ||
    process.env.REACT_APP_VEILSTREAM_AUTH_ROUTER_URL ||
    process.env.REACT_APP_VEILSTREAM_AUTH_BROKER_URL
  )?.replace(/\/$/, '') || null;
}

function randomState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Standard OAuth authorization URL for preview environments. */
export function externalOAuthStartUrl(provider = 'google') {
  const issuer = oauthIssuer();
  if (!issuer) {
    return null;
  }

  const callbackPath = process.env.REACT_APP_OAUTH_CALLBACK_PATH || '/auth/callback';
  const redirectUri = `${window.location.origin.replace(/\/$/, '')}${callbackPath}`;
  const state = randomState();
  sessionStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    redirect_uri: redirectUri,
    state,
  });

  const projectId = process.env.REACT_APP_VEILSTREAM_PROJECT_ID;
  const environmentId =
    process.env.REACT_APP_VEILSTREAM_ENVIRONMENT_ID ||
    process.env.REACT_APP_ENVIRONMENT_NAME ||
    process.env.ENVIRONMENT_NAME;
  if (projectId) {
    params.set('project_id', projectId);
  }
  if (environmentId) {
    params.set('environment_id', environmentId);
  }

  return `${issuer}/auth/start/${provider}?${params}`;
}

export function takeExpectedOAuthState() {
  const state = sessionStorage.getItem('oauth_state');
  sessionStorage.removeItem('oauth_state');
  return state;
}
