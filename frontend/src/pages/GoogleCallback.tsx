import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');
    const email = params.get('email');
    if (token) {
      localStorage.setItem('token', token);
      // Save user info from URL if present
      if (username || email) {
        localStorage.setItem('user', JSON.stringify({ username, email }));
      }
      // Optionally, fetch user profile from /api/auth/me for more info
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(meData => {
          if (
            meData && meData.user &&
            (meData.user.username || meData.user.name || meData.user.email)
          ) {
            localStorage.setItem('user', JSON.stringify(meData.user));
          }
          // else: keep the user from URL
          navigate('/', { replace: true });
        })
        .catch(() => {
          navigate('/', { replace: true });
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div>Signing you in...</div>;
};

export default GoogleCallback;
