import  { useState, useEffect } from 'react';
import { GetProfile,Logout } from '../control/auth';

function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  type UserProfile = { email: string } | null;
  const [user, setUser] = useState<UserProfile>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const profileData = await GetProfile(token);
        setUser(profileData);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="p-4 bg-gray-100 shadow-md nav">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="text-lg font-bold text-gray-800">Budget Tracker</div>

        {/* Hamburger Button (Mobile) */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-gray-700 hover:text-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md"
          aria-label="Toggle navigation"
          id ="menu-btn"
          style={{ zIndex: 20 }}
        >
          {isOpen ? (
            // Close Icon (X)
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger Icon
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Menu */}
        <div
          className={`
            ${isOpen ? 'block' : 'hidden'}
            md:flex md:items-center 
            md:w-auto 
            w-full 
            absolute md:static 
            top-16 left-0 right-0 
            bg-gray-100 md:bg-transparent 
            shadow-lg md:shadow-none 
            z-10
          `}
          id ="menu"
        >
          <menu className="flex flex-col md:flex-row md:space-x-2 p-4 md:p-0">
            <a
              href="/add"
              className="text-gray-800 md:text-black p-2 hover:bg-sky-300 rounded-md block text-center md:text-left"
            >
              Add record
            </a>
            <a
              href="/activity"
              className="text-gray-800 md:text-black p-2 hover:bg-sky-300 rounded-md block text-center md:text-left mt-1 md:mt-0"
            >
              Activity
            </a>
            <a
              href="/summary"
              className="text-gray-800 md:text-black p-2 hover:bg-sky-300 rounded-md block text-center md:text-left mt-1 md:mt-0"
            >
              Summary
            </a>

            {/* Conditional Rendering */}
            {!user ? (
              <a
                href="/login"
                className="text-gray-800 md:text-black p-2 hover:bg-sky-300 rounded-md block text-center md:text-left mt-1 md:mt-0"
              >
                Login
              </a>
            ) : (
              <>
                <a
                  href="/profile"
                  className="text-gray-800 md:text-black p-2 hover:bg-sky-300 rounded-md block text-center md:text-left mt-1 md:mt-0"
                >
                  Profile
                </a>
                <span className="text-gray-700 p-2 block text-center md:text-left mt-1 md:mt-0">
                  {user.email}
                </span>
                 <a
                  onClick={() => Logout(localStorage.getItem('token') || "")}
                  className="text-gray-800 md:text-black p-2 hover:bg-sky-300 rounded-md block text-center md:text-left mt-1 md:mt-0"
                >
                 Logout
                </a>
              </>
            )}
          </menu>
        </div>
      </div>
    </nav>
  );
}

export default Nav;
