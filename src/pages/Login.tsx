// 1. ลบ 'React' ที่ไม่ได้ใช้ออก
import { useState } from 'react';
import { Getlogin } from '../control/auth';
import { useNavigate } from 'react-router-dom'; // 2. Import useNavigate

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 3. เพิ่ม State สำหรับ Error และ Loading
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 4. เตรียม hook สำหรับเปลี่ยนหน้า
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ป้องกันหน้าโหลดใหม่ (ถูกต้องอยู่แล้ว)
    
    setIsLoading(true); // 5. เริ่มโหลด...
    setError(null);     // 6. ล้าง Error เก่า

    try {
      await Getlogin({ email, password });
      navigate('/'); // 7. ส่งไปหน้าแรก (วิธีที่ถูกต้อง)
    } catch (err) {
      console.error('Login failed:', err);
      // 8. แสดง Error ให้ User เห็น
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false); // 9. หยุดโหลด (ไม่ว่าจะสำเร็จหรือล้มเหลว)
    }
  };



  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Welcome Back 👋
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Please enter your credentials to log in
        </p>

        {/* 10. ย้าย handleSubmit มาที่ <form> */}
        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* 11. แสดง Error Message ถ้ามี */}
          {error && (
            <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email} // (แนะนำ) เพิ่ม value
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password} // (แนะนำ) เพิ่ม value
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            
            // 12. ลบ onClick ออก
            disabled={isLoading} // 13. ปิดปุ่มตอนโหลด
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* 14. เปลี่ยนข้อความตอนโหลด */}
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{' '}
          <a href="/register" className="text-indigo-600 hover:underline font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;