import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Redirect to login page on mount
    window.location.href = '/setup/login.html';
  }, []);

  return null;
}
