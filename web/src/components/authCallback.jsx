import { useContext, useEffect, useState } from 'react';
import { Container, Header, Message, Segment } from 'semantic-ui-react';
import { useHistory, useLocation } from 'react-router-dom';
import { UserContext } from '../App';
import { login } from '../utils/api';

const OAUTH_ERROR_MESSAGES = {
  oauth_denied: 'Sign-in was cancelled.',
  invalid_state: 'Sign-in session expired. Please try again.',
  state_expired: 'Sign-in session expired. Please try again.',
  provider_exchange_failed: 'Sign-in with Google failed. Please try again.',
  identity_validation_failed: 'Sign-in could not be verified. Please try again.',
  callback_not_allowed: 'This site is not configured for sign-in.',
  provider_not_configured: 'Google sign-in is not configured for this app.',
};

export default function AuthCallback() {
  const history = useHistory();
  const location = useLocation();
  const { setUser, setAccessToken } = useContext(UserContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('veilstream_error');
    if (oauthError) {
      setError(OAUTH_ERROR_MESSAGES[oauthError] || 'Sign-in failed. Please try again.');
      return;
    }

    // Same shape as Google One Tap: an opaque credential string exchanged server-side.
    const credential = params.get('veilstream_ticket');
    if (!credential) {
      history.replace('/login');
      return;
    }

    login(credential)
      .then(({ token, profile }) => {
        setUser(profile);
        setAccessToken(token);
        history.replace('/');
      })
      .catch((err) => {
        console.error('OAuth callback login failed', err);
        setError('Sign-in failed. Please try again.');
      });
  }, [history, location.search, setAccessToken, setUser]);

  if (error) {
    return (
      <Container>
        <br />
        <Header as="h1">Sign in</Header>
        <Segment basic>
          <Message negative>{error}</Message>
        </Segment>
      </Container>
    );
  }

  return (
    <Container>
      <br />
      <Header as="h1">Sign in</Header>
      <Segment basic>Signing you in…</Segment>
    </Container>
  );
}
