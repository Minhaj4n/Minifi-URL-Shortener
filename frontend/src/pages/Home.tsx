import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Consider adding icons if you have an icon library like react-icons
// import { LockClosedIcon, ChartBarIcon, BoltIcon, CodeBracketIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

const FeatureIcon = () => (
  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600 text-white sm:h-12 sm:w-12">
    <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  </div>
);

const Home: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50); // Short delay for mount transition
    return () => clearTimeout(timer);
  }, []);

  // Logout confirmation handler
  const handleLogoutConfirmation = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  return (
    <div 
      className={`min-h-screen bg-gradient-to-b from-white to-gray-50 transition-opacity duration-500 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* --- Navigation Bar --- */}
      <nav className="bg-blue-100 shadow-md text-blue-600 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <span className="text-2xl font-bold text-blue-600">Minifi</span>
        </div>
        </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="overflow-hidden hidden sm:block">
                  <span 
                    className={`block text-gray-700 text-base transform transition-all duration-500 ease-out ${ 
                      isMounted && user 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 -translate-y-3'
                    }`}
                  > 
                    Welcome, <span className="font-medium">{user?.username}</span>
                  </span>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogoutConfirmation}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-md text-sm font-medium text-blue-700 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main>
        <div className="pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
              {/* Text Content */} 
              <div className="text-center lg:text-left">
                 <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block xl:inline">Shorten Links,</span>
                    <span className="block text-blue-600 xl:inline ml-0 xl:ml-2">Track Performance.</span>
                  </h1>
                  <p className="mt-4 text-lg text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    Minifi is a sleek, modern URL shortener built for simplicity, speed, and smart tracking. Turn long, messy links into short, beautiful ones — and track their journey with ease.
                  </p>
                  {/* Buttons */} 
                  <div className="mt-8 sm:mt-10 flex flex-wrap gap-3 justify-center lg:justify-start">
                    {isAuthenticated ? (
                       <button
                         onClick={() => navigate('/dashboard')}
                         className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                       >
                         Go to Your Dashboard
                       </button>
                    ) : (
                      <>
                        <button
                           onClick={() => navigate('/register')}
                           className="flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        >
                          Get started free
                        </button>
                        <button
                           onClick={() => navigate('/login')}
                           className="flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-blue-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        >
                          Log In
                        </button>
                      </>
                    )}
                  </div>
              </div>
              {/* Hero Illustration - Conditional based on auth status */} 
              <div className="mt-12 lg:mt-0">
                 <img
                   className="block mx-auto w-full max-w-lg drop-shadow-xl rounded-lg"
                   src={isAuthenticated ? "/undraw_online-connection_c56e.svg" : "/undraw_share-link_jr6w.svg"}
                   alt={isAuthenticated ? "Illustration of online connection" : "Illustration of sharing links"}
                 />
              </div>
            </div>
          </div>
        </div>

        {/* --- Features Section --- */}
        <div className="py-16 bg-white overflow-hidden lg:py-24">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             {/* Section Title */} 
            <div className="relative text-center mb-16 lg:mb-24">
              <h2 className="text-base font-semibold text-blue-600 tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to manage your links
              </p>
              <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
                From simple shortening to powerful analytics, Minifi provides the tools for effective link management.
              </p>
            </div>

            {/* Features Grid */} 
            <div className="grid gap-12 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <FeatureIcon />
                <h3 className="mt-5 text-xl font-semibold text-gray-900">Secure & Reliable</h3>
                <p className="mt-2 text-base text-gray-500">
                  Generate concise and trustworthy links for easy sharing, built on a robust foundation.
                </p>
              </div>
              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <FeatureIcon />
                <h3 className="mt-5 text-xl font-semibold text-gray-900">Real-time Analytics</h3>
                <p className="mt-2 text-base text-gray-500">
                  Track every click on your links to understand audience engagement over time.
                </p>
              </div>
              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <FeatureIcon />
                <h3 className="mt-5 text-xl font-semibold text-gray-900">Fast Redirection</h3>
                <p className="mt-2 text-base text-gray-500">
                  Ensure a seamless experience for your users with quick and efficient link redirection.
                </p>
              </div>
              {/* Feature 4 */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <FeatureIcon />
                <h3 className="mt-5 text-xl font-semibold text-gray-900">Clean Design</h3>
                <p className="mt-2 text-base text-gray-500">
                  Enjoy a smooth and intuitive user experience with our clutter-free interface.
                </p>
              </div>
               {/* Feature 5 */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <FeatureIcon />
                <h3 className="mt-5 text-xl font-semibold text-gray-900">User Dashboard</h3>
                <p className="mt-2 text-base text-gray-500">
                  Manage all your shortened links and view detailed analytics in one place.
                </p>
              </div>
              {/* Feature 6 (Example) */} 
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <FeatureIcon />
                <h3 className="mt-5 text-xl font-semibold text-gray-900">Developer Friendly</h3>
                <p className="mt-2 text-base text-gray-500">
                   Easily integrate Minifi with your own applications (API coming soon!).
                </p>
              </div>
            </div>

            {/* --- Final Call to Action --- */}
            <div className="mt-20 py-16 bg-blue-50 rounded-xl text-center"> 
               <h3 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                  Ready to simplify your links?
               </h3>
               <p className="mt-3 text-lg text-gray-600">
                 Minifi it. Share it. Track it. Boom.
               </p>
      {!isAuthenticated && (
                 <div className="mt-8 flex justify-center">
                   <div className="inline-flex rounded-md shadow">
          <button
            onClick={() => navigate('/register')}
                       className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                     >
                       Get started today
                     </button>
                   </div>
                 </div>
               )}
               {isAuthenticated && (
                 <div className="mt-8 flex justify-center">
                   <div className="inline-flex rounded-md shadow">
                     <button
                       onClick={() => navigate('/dashboard')}
                       className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                     >
                       Go to Dashboard
          </button>
                   </div>
                 </div>
               )}
             </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Home; 