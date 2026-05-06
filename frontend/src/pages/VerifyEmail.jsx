import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    const verifyUrl = `${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
    axios
      .get(verifyUrl)
      .then((res) => {
        // Store the token from the response
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setStatus('success');
        setTimeout(() => navigate('/'), 2000);
      })
      .catch((err) => {
        console.error('Verification error:', err.response?.data || err.message);
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
      });
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-96 text-center">
        {status === 'verifying' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300">Verifying your email...</p>
          </div>
        )}
        {status === 'success' && (
          <div>
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <p className="text-green-600 font-semibold mb-2">Email verified successfully!</p>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to dashboard...</p>
          </div>
        )}
        {status === 'error' && (
          <div>
            <div className="text-red-600 text-5xl mb-4">✗</div>
            <p className="text-red-600 font-semibold mb-2">Invalid or expired verification link.</p>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
}