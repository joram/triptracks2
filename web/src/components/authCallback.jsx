import { useContext, useEffect, useState } from 'react';
import { Container, Header, Message, Segment } from 'semantic-ui-react';
import { useHistory, useLocation } from 'react-router-dom';
import { UserContext } from '../App';
import { loginWithBrokerTicket } from '../utils/api';

const ERROR_MESSAGES = {
  oauth_denied: 'Sign-in was cancelled.',
  invalid_state: 'Sign-in session expired. Please try again.',
  state_expired: 'Sign-in session expired. Please try again.',
  provider_exchange_failed: 'Sign-in with the provider failed. Please try again.',
  identity_validation_failed: 'Sign-in could not be verified. Please try again.',
  callback_not_allowed: 'This preview URL is not allowlisted for auth broker login.',
  provider_not_configured: 'Google sign-in is not configured for this project on the auth broker.',
};

export default function AuthCallback() {
  const history = useHistory();
  const location = useLocation();
  const { setUser, setAccessToken } = useContext(UserContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brokerError = params.get('veilstream_error');
    if (brokerError) {
      setError(ERROR_MESSAGES[brokerError] || 'Sign-in failed. Please try again.');
      return;
    }

    const ticket = params.get('veilstream_ticket');
    if (!ticket) {
      history.replace('/login');
      return;
    }

    loginWithBrokerTicket(ticket)
      .then((data) => {
        const profile = {
          email: data.email,
          name: data.name || data.email,
          sub: data.provider_subject,
          id: data.user_id,
        };
        setUser(profile);
        setAccessToken(data.token);
        history.replace('/');
      })
      .catch((err) => {
        console.error('Broker login failed', err);
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
