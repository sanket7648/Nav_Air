import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      console.log('GoogleCallback: Saved token:', token);

      // Fetch user profile from /api/auth/me
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(meData => {
          console.log('GoogleCallback: Fetched profile:', meData);
          if (meData && meData.user) {
            localStorage.setItem('user', JSON.stringify(meData.user));
            console.log('GoogleCallback: Saved user to localStorage:', meData.user);
          }
          navigate('/', { replace: true });
        })
        .catch(err => {
          console.error('GoogleCallback: Error fetching profile:', err);
          navigate('/', { replace: true });
        });
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div>Signing you in...</div>;
};

export default GoogleCallback;
