import { useContext, useEffect, useState } from 'react';
import { Container, Header, Message, Segment } from 'semantic-ui-react';
import { useHistory, useLocation } from 'react-router-dom';
import { UserContext } from '../App';
import { login } from '../utils/api';

const OAUTH_ERROR_MESSAGES = {
  access_denied: 'Sign-in was cancelled.',
  invalid_request: 'Sign-in session expired. Please try again.',
  server_error: 'Sign-in failed. Please try again.',
};

export default function AuthCallback() {
  const history = useHistory();
  const location = useLocation();
  const { setUser, setAccessToken } = useContext(UserContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      setError(OAUTH_ERROR_MESSAGES[oauthError] || 'Sign-in failed. Please try again.');
      return;
    }

    const code = params.get('code');
    if (!code) {
      history.replace('/login');
      return;
    }

    login(code)
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
