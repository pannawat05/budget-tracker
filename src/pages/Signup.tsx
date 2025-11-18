import { useState } from 'react';
import { Getregister } from '../control/auth';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);

    try {
      await Getregister({ email, password });
      // สมัครสำเร็จ -> ไปหน้า login
      navigate('/login');
    } catch (err) {
      console.error('Sign up failed:', err);
      // แสดง Error ให้ User เห็น
      setError('Registration failed. Please try again or use a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Back to Login Button */}
      <a 
        href="/login" 
        className="absolute top-4 left-4 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        aria-label="Back to Login"
      >
        <div className="flex">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 640 640"
          className="w-6 h-6 text-indigo-600"
          fill="currentColor"
        >
          <path d="M236.3 107.1C247.9 96 265 92.9 279.7 99.2C294.4 105.5 304 120 304 136L304 272.3L476.3 107.2C487.9 96 505 92.9 519.7 99.2C534.4 105.5 544 120 544 136L544 504C544 520 534.4 534.5 519.7 540.8C505 547.1 487.9 544 476.3 532.9L304 367.7L304 504C304 520 294.4 534.5 279.7 540.8C265 547.1 247.9 544 236.3 532.9L44.3 348.9C36.5 341.3 32 330.9 32 320C32 309.1 36.5 298.7 44.3 291.1L236.3 107.1z"/>
        </svg>
        Back to Login
        </div>
      </a>

      {/* Signup Card */}
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Create Account 🚀
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Please enter your credentials to sign up
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-600 hover:underline font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;