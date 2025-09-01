import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { token } = useParams();
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyUserEmail = async () => {
      if (!token) {
        setError('Invalid verification link. Please check your email for the correct link.');
        setLoading(false);
        return;
      }

      try {
        const result = await verifyEmail(token);
        if (result.success) {
          setMessage(result.message);
          setSuccess(true);
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('An error occurred during email verification. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    verifyUserEmail();
  }, [token, verifyEmail, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verifying your email...
            </h2>
            <p className="text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {success ? 'Your email has been verified successfully!' : 'Email verification failed'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                  {message}
                </div>
              )}
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>Great! Your email has been verified.</p>
                  <p>You can now log in to your account.</p>
                  <p>You will be redirected to the login page in a few seconds.</p>
                </div>
                <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                  Go to login now
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p>The verification link may be invalid or expired.</p>
                  <p>Please try logging in or request a new verification email.</p>
                </div>
                <div className="flex space-x-4 justify-center">
                  <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                    Go to login
                  </Link>
                  <Link to="/register" className="font-medium text-red-600 hover:text-red-500">
                    Register again
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
