import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// DTO Interfaces (consistent with backend)
interface UrlMappingDTO {
  id: number;
  originalUrl: string;
  shortUrl: string; // Expecting just the code, e.g., "abcdef"
  clickCount: number;
  createdDate: string;
  username: string;
}

interface ClickEventDTO {
  clickDate: string;
    count: number;
}

// --- Helper Function to Format Date for API ---
const formatDateForAPI = (dateString: string): string => {
  // Ensures the date is treated as local time and formatted correctly for backend
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
};
const formatEndDateForAPI = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T23:59:59`;
};

// --- Chart Configuration ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Clicks Over Time' // Title will be updated dynamically
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          return ` Clicks: ${context.raw}`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0 // Ensure integer ticks
      }
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  }
};

// --- Data Fetching Function for Analytics ---
// Takes shortUrl code (string) or null
const fetchAnalytics = async (shortUrlCode: string | null, startDateStr: string, endDateStr: string): Promise<ClickEventDTO[]> => {
  const params = {
    startDate: formatDateForAPI(startDateStr),
    endDate: formatEndDateForAPI(endDateStr)
  };
  let apiUrl = '/api/urls/analytics/user'; // Default to overall user analytics
  let logPrefix = '[Overall Analytics]';

  if (shortUrlCode !== null) {
    apiUrl = `/api/urls/analytics/${shortUrlCode}`; // Use shortUrlCode directly in the path
    logPrefix = `[URL Analytics Code: ${shortUrlCode}]`;
  }

  console.log(`${logPrefix} Fetching from ${apiUrl} with params:`, params);
  
  try {
    const response = await axios.get<ClickEventDTO[]>(apiUrl, { params });
    console.log(`${logPrefix} Response data:`, response.data);
    
    const data = Array.isArray(response.data) ? response.data : [];
    
    // Sort the data by date
    const sortedData = data.sort((a, b) => 
      new Date(a.clickDate).getTime() - new Date(b.clickDate).getTime()
    );
    
    console.log(`${logPrefix} Processed & sorted data:`, sortedData);
    return sortedData;
  } catch (error) {
    console.error(`${logPrefix} Error fetching analytics:`, error);
    if (axios.isAxiosError(error)) {
      console.error(`${logPrefix} Axios error details:`, error.response?.data || error.message);
    }
    // Return empty array to avoid breaking UI, but log the error
    return []; 
  }
};

// --- Dashboard Component ---
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // State for URL Shortening
  const [originalUrlInput, setOriginalUrlInput] = useState('');
  const [shortenError, setShortenError] = useState('');
  const [lastShortened, setLastShortened] = useState<UrlMappingDTO | null>(null);

  // State for Analytics - selectedUrl now stores the shortUrl string
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // State to track which URL was just copied
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // State to trigger animation
  const [isMounted, setIsMounted] = useState(false);
  const [welcomeAnimation, setWelcomeAnimation] = useState(false);

  // Trigger mount animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50); 
    // Trigger welcome message animation slightly later
    const welcomeTimer = setTimeout(() => {
      setWelcomeAnimation(true);
    }, 200); // Adjust delay as needed
    return () => {
      clearTimeout(timer);
      clearTimeout(welcomeTimer);
    }
  }, []);

  // Logout confirmation handler
  const handleLogoutConfirmation = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  // --- Data Fetching: User's URLs ---
  const { data: urls, isLoading: urlsLoading } = useQuery<UrlMappingDTO[]>({
    queryKey: ['urls', user?.username], // Include username in key
    queryFn: async () => {
      const response = await axios.get('/api/urls/myurls');
      // console.log('URLs response:', response.data); // Optional: uncomment for debugging
      return response.data;
    },
    enabled: !!user // Only fetch if user is loaded
  });

  // --- Data Fetching: Analytics ---
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery<ClickEventDTO[]>({
    // Key changes based on selectedUrl (shortUrl string), startDate, and endDate
    queryKey: ['analytics', selectedUrl ?? 'user', startDate, endDate], 
    queryFn: () => fetchAnalytics(selectedUrl, startDate, endDate), // Pass selectedUrl (shortUrl string or null)
    enabled: !!user, // Only fetch analytics if user is loaded
    refetchOnWindowFocus: false, // Optional: disable refetch on window focus if causing issues
    // staleTime: 5 * 60 * 1000, // Optional: Set data as stale after 5 minutes
  });

  // --- Mutation: Shorten URL ---
  const shortenMutation = useMutation<UrlMappingDTO, Error, { originalUrl: string }>({
    mutationFn: async ({ originalUrl }) => {
      const response = await axios.post<UrlMappingDTO>('/api/urls/shorten', { originalUrl });
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Shortened URL data:', data);
      setLastShortened(data); // Store last shortened URL info
      setOriginalUrlInput(''); // Clear input
      setShortenError('');
      queryClient.invalidateQueries({ queryKey: ['urls', user?.username] }); // Refetch URL list
    },
    onError: (error) => {
      console.error('Error shortening URL:', error);
      setShortenError(`Failed to shorten URL: ${error.message}`);
      setLastShortened(null);
    },
  });

  const handleShortenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShortenError('');
    setLastShortened(null);
    if (!originalUrlInput.trim()) {
      setShortenError('Please enter a URL.');
      return;
    }
    shortenMutation.mutate({ originalUrl: originalUrlInput });
  };

  // --- Calculations & Formatting ---
  const totalClicks = analytics ? analytics.reduce((sum, event) => sum + event.count, 0) : 0;
  
  // Function to create the full short URL for linking
  const getFullShortUrl = (shortCode: string): string => {
    const base = (axios.defaults.baseURL || '').replace(/\/$/, '');
    const code = shortCode.replace(/^\//, '');
    return `${base}/${code}`;
  };
  
  // Prepare chart data dynamically, filling in missing dates
  const generateChartData = () => {
    if (!analytics) return { labels: [], datasets: [] };

    const labels: string[] = [];
    const dataPoints: number[] = [];
    // Map date string (YYYY-MM-DD) from backend data to count
    const analyticsMap = new Map(analytics.map(event => [event.clickDate.split('T')[0], event.count])); 

    let currentDate = new Date(startDate + 'T00:00:00'); // Interpret start date in local time
    const lastDate = new Date(endDate + 'T00:00:00');   // Interpret end date in local time

    // Ensure loop works across month/year changes correctly
    while (currentDate <= lastDate) {
      // Create the key for the map lookup in YYYY-MM-DD format from local date parts
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStringForMap = `${year}-${month}-${day}`; 

      // Use locale string for the display label on the chart
      labels.push(currentDate.toLocaleDateString()); 
      // Lookup count using the correctly formatted local date string
      dataPoints.push(analyticsMap.get(dateStringForMap) || 0); 
      
      // Move to the next day (modifies currentDate in place)
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Clicks',
          data: dataPoints,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          fill: false
        }
      ]
    };
  };

  const chartData = generateChartData();
  
  // Update chart title dynamically
  const dynamicChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: selectedUrl ? 'Clicks Over Time (Selected URL)' : 'Clicks Over Time (All URLs)'
      }
    }
  };

  // Function to copy text to clipboard
  const handleCopy = (shortCode: string) => {
    const fullUrl = getFullShortUrl(shortCode);
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedUrl(shortCode); // Set the copied URL code for feedback
      setTimeout(() => setCopiedUrl(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy URL: ', err);
      // Optionally show an error message to the user
    });
  };

  // --- Render Logic ---
  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 transition-opacity duration-500 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Navigation - Updated with sticky classes and light blue background */}
      <nav className="bg-blue-100 shadow-sm sticky top-0 z-50 border-b border-gray-200"> {/* Changed bg-white/80 backdrop-blur-md to bg-blue-100 */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex justify-between h-16">
              {/* Logo */} 
              <div className="flex items-center">
                 <Link to="/" className="text-2xl font-bold text-blue-600">
                   Minifi
                 </Link>
               </div>
               {/* Right side: Welcome message, Home button, Logout button */}
              <div className="flex items-center space-x-4">
                 {/* Welcome Message with Fade-in & Slide-down */} 
                 <div className="overflow-hidden"> {/* Container to clip the slide */} 
                   <span 
                     className={`block text-gray-700 text-base transform transition-all duration-500 ease-out ${ 
                       welcomeAnimation ? 'opacity-100 translate-y-0' 
                         : 'opacity-0 -translate-y-3' // Start transparent and slightly up
                     }`}
                    > 
                     Welcome, <span className="font-medium">{user?.username}</span>
                   </span>
                 </div>
                 <button
                   onClick={() => navigate('/')}
                   className="px-4 py-2 rounded-md text-sm font-medium text-blue-700 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                 >
                   Home
                 </button>
                 <button
                   onClick={handleLogoutConfirmation}
                   className="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                 >
                   Logout
                 </button>
               </div>
           </div>
         </div>
       </nav>

      {/* Add padding-top to main content area to prevent overlap with sticky nav */}
      <div className="max-w-7xl mx-auto pt-6 pb-6 sm:px-6 lg:px-8"> {/* Added pt-6 */} 
        
        {/* Shorten URL Form */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Shorten a New URL</h2>
          <form onSubmit={handleShortenSubmit} className="space-y-4">
            <div>
              <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">Enter URL to shorten:</label>
              <input
                id="originalUrl"
                type="url"
                value={originalUrlInput}
                onChange={(e) => setOriginalUrlInput(e.target.value)}
                placeholder="https://example.com/very/long/url/to/shorten"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={shortenMutation.isPending}
              />
            </div>
            <button
              type="submit"
              disabled={shortenMutation.isPending}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {shortenMutation.isPending ? 'Shortening...' : 'Shorten URL'}
            </button>
          </form>
          {shortenError && (
            <p className="mt-3 text-red-600">{shortenError}</p>
          )}
          {lastShortened && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">Successfully shortened!</p>
              <p className="text-sm text-gray-600 mt-1">Original: <span className="break-all">{lastShortened.originalUrl}</span></p>
              <p className="text-sm text-gray-600">Short URL: 
                <a 
                  href={getFullShortUrl(lastShortened.shortUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1 break-all"
                >
                  {getFullShortUrl(lastShortened.shortUrl)}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Main Content Grid: URL List and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
        {/* URL List */}
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Your Shortened URLs</h2>
          {urlsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
            </div>
            ) : !urls || urls.length === 0 ? (
              <p className="text-gray-500">You haven't shortened any URLs yet.</p>
          ) : (
            <div className="space-y-4">
              {urls?.map((url) => (
                <div
                    key={url.id} // Keep using numerical id for React key
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ease-in-out ${
                      selectedUrl === url.shortUrl // Compare with shortUrl string for highlighting
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    // Set selectedUrl state to the shortUrl string or null
                    onClick={() => setSelectedUrl(prev => prev === url.shortUrl ? null : url.shortUrl)} 
                  >
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm text-gray-500 break-all pr-2">{url.originalUrl}</p>
                      <span className="text-sm text-gray-600 font-medium whitespace-nowrap">{url.clickCount} total clicks</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                    <a
                        href={getFullShortUrl(url.shortUrl)} // Use helper function
                      target="_blank"
                      rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking link
                        className="text-blue-600 hover:underline break-all text-lg font-medium mr-3"
                      >
                        {/* Display the full short URL */} 
                        {getFullShortUrl(url.shortUrl)} 
                      </a>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); // Prevent card click
                            handleCopy(url.shortUrl); 
                          }}
                          title="Copy short URL"
                          className={`p-1.5 rounded-md transition-colors ${ 
                            copiedUrl === url.shortUrl 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                          }`}
                        >
                          {/* Conditional Icon/Text */} 
                          {copiedUrl === url.shortUrl ? (
                            // CheckIcon (Heroicons example)
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            // ClipboardDocumentIcon (Heroicons example)
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          Created: {new Date(url.createdDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>

          {/* Analytics Section */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-semibold mb-4">
              {selectedUrl ? 'URL Analytics' : 'Overall Analytics'} 
            </h2>
            {/* Date Range Picker */}
            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date Range:</label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  max={endDate} // Prevent start date being after end date
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min={startDate} // Prevent end date being before start date
                />
              </div>
            </div>

            {/* Analytics Display Area */}
            {analyticsLoading ? (
              <div className="space-y-4">
                 <div className="h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                 <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
                 <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            ) : analyticsError ? (
              <div className="text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
                Error loading analytics: {analyticsError instanceof Error ? analyticsError.message : 'Unknown error'}
              </div>
            ) : !analytics || analytics.length === 0 ? (
               <div className="text-gray-500 p-4 border rounded-lg bg-gray-50 text-center">
                 No click data available for the selected {selectedUrl ? 'URL and' : ''} date range.
                    </div>
            ) : (
              <div className="space-y-6">
                {/* Total Clicks Card */}
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Total Clicks</h3>
                  <p className="text-3xl font-bold text-blue-600">{totalClicks}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Between {new Date(startDate + 'T00:00:00').toLocaleDateString()} and {new Date(endDate + 'T00:00:00').toLocaleDateString()}
                  </p>
              </div>

                {/* Clicks Over Time Chart */}
                <div className="p-4 bg-white border rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                     {selectedUrl ? 'Daily Clicks (Selected URL)' : 'Daily Clicks (All URLs)'} 
                  </h3>
                  <div className="h-64 relative">
                    <Line data={chartData} options={dynamicChartOptions} />
                    </div>
                </div>
              </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 