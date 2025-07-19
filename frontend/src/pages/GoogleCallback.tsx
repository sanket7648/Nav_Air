import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');
    const email = params.get('email');
    
    if (token) {
      // Create user data from URL parameters
      const userData = username || email ? { username, email } : undefined;
      
      // Use AuthContext to handle the login
      loginWithToken(token, userData)
        .then(result => {
          if (result.success) {
            navigate('/', { replace: true });
          } else {
            console.error('Google login failed:', result.message);
            navigate('/login');
          }
        })
        .catch(() => {
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [navigate, loginWithToken]);

  return <div>Signing you in...</div>;
};

export default GoogleCallback;
