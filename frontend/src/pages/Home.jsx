import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlogList } from '../components/blog/BlogList';
import { SuggestedUsers } from '../components/profile/SuggestedUsers';
import { useAuth } from '../context/AuthContext';
import { blogService } from '../services/blogService';

export const Home = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('published'); // 'published', 'following', 'trending'
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dailyThought, setDailyThought] = useState("");

  const thoughts = [
    "Stay hungry, stay foolish.",
    "I think, therefore I am.",
    "The unexamined life is not worth living.",
    "Be the change that you wish to see in the world.",
    "In the middle of difficulty lies opportunity.",
    "Success is not final, failure is not fatal.",
    "Do what you can, with what you have, where you are.",
    "Happiness depends upon ourselves.",
    "Turn your wounds into wisdom.",
    "Knowledge is power.",
    "The purpose of our lives is to be happy.",
    "Dream big and dare to fail.",
    "It always seems impossible until it’s done.",
    "Life is what happens when you’re busy making other plans.",
    "Do one thing every day that scares you.",
    "The only thing we have to fear is fear itself.",
    "That which does not kill us makes us stronger.",
    "The journey of a thousand miles begins with one step.",
    "Well done is better than well said.",
    "He who opens a school door, closes a prison.",
    "Everything you can imagine is real.",
    "What we think, we become.",
    "If you judge people, you have no time to love them.",
    "The secret of getting ahead is getting started.",
    "A person who never made a mistake never tried anything new.",
    "Do what you feel in your heart to be right.",
    "If opportunity doesn’t knock, build a door.",
    "Strive not to be a success, but rather to be of value.",
    "The best way to predict the future is to create it.",
    "An investment in knowledge pays the best interest.",
    "Act as if what you do makes a difference.",
    "Success usually comes to those who are too busy to be looking for it.",
    "Don’t watch the clock; do what it does. Keep going.",
    "Keep your face always toward the sunshine.",
    "Limit your ‘always’ and your ‘nevers’.",
    "Nothing will work unless you do.",
    "Try to be a rainbow in someone’s cloud.",
    "You miss 100% of the shots you don’t take.",
    "Whether you think you can or you think you can’t, you’re right.",
    "The best revenge is massive success.",
    "Everything has beauty, but not everyone sees it.",
    "What lies behind us and what lies before us are tiny matters.",
    "Believe you can and you’re halfway there.",
    "Do not go where the path may lead, go instead where there is no path.",
    "Success is walking from failure to failure with no loss of enthusiasm.",
    "Hardships often prepare ordinary people for an extraordinary destiny.",
    "If you want to lift yourself up, lift up someone else.",
    "Opportunities don’t happen. You create them.",
    "Don’t count the days, make the days count.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Everything you’ve ever wanted is on the other side of fear.",
    "Start where you are. Use what you have. Do what you can.",
    "Quality is not an act, it is a habit.",
    "If you’re going through hell, keep going.",
    "We become what we repeatedly do.",
    "Make each day your masterpiece.",
    "Turn your face to the sun and the shadows fall behind you.",
    "Your time is limited, don’t waste it living someone else’s life.",
    "You must be the master of your own destiny.",
    "Doubt kills more dreams than failure ever will.",
    "Small deeds done are better than great deeds planned.",
    "Don’t limit your challenges. Challenge your limits.",
    "Success is how high you bounce when you hit bottom.",
    "Action is the foundational key to all success.",
    "Perseverance is not a long race; it is many short races.",
    "What you get by achieving your goals is not as important as what you become.",
    "Man is condemned to be free.",
    "He who has a why to live can bear almost any how.",
    "No man ever steps in the same river twice.",
    "The only true wisdom is in knowing you know nothing.",
    "Liberty lies in being able to do what one ought to will.",
    "To be is to be perceived.",
    "A lesson without pain is meaningless.",
    "If you don’t take risks, you can’t create a future.",
    "Hard work is worthless for those that don’t believe in themselves.",
    "Power comes in response to a need, not a desire.",
    "In this world, wherever there is light, there are also shadows.",
    "People’s lives don’t end when they die, it ends when they lose faith.",
    "Whatever you lose, you’ll find it again.",
    "The world isn’t perfect. But it’s there for us.",
    "Fear is not evil. It tells you what your weakness is.",
    "If you win, you live. If you lose, you die.",
    "It is never too late to be what you might have been.",
    "We accept the love we think we deserve.",
    "And, when you want something, all the universe conspires to help you achieve it.",
    "Not all those who wander are lost.",
    "So it goes.",
    "It’s fine to celebrate success but more important to heed failure.",
    "When something is important enough, you do it.",
    "Risk comes from not knowing what you’re doing.",
    "Play long-term games with long-term people.",
    "The deeper the darkness, the brighter the light.",
    "Sometimes the worst place you can be is in your own head.",
    "Silence speaks when words can’t.",
    "Pain changes people.",
    "Stars can’t shine without darkness."
  ];

  useEffect(() => {
     blogService.getCategories().then(setCategories).catch(console.error);
     const randomIndex = Math.floor(Math.random() * thoughts.length);
     setDailyThought(thoughts[randomIndex]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-10">
      <div className="flex-1 min-w-0">
        {dailyThought && (
          <div className="mb-6 p-6 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-2xl shadow-lg border-none animate-in fade-in slide-in-from-top-4 duration-700">
            <p className="text-sm font-bold text-blue-200 dark:text-blue-300 uppercase tracking-widest mb-2 italic">Daily Inspiration</p>
            <p className="text-white font-medium font-serif italic text-xl line-clamp-2">"{dailyThought}"</p>
          </div>
        )}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary-600 dark:text-primary-400 mb-4 tracking-tight">
            Welcome to Blog Platform
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Share your thoughts, ideas, and stories with the world.
          </p>
        </div>

        <div className="mb-8 flex items-center gap-6 border-b border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setActiveTab('published')} 
                className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'published' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                Latest
                {activeTab === 'published' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />}
            </button>
            <button 
                onClick={() => setActiveTab('trending')} 
                className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'trending' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                Trending
                {activeTab === 'trending' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />}
            </button>
            {user && (
                <button 
                    onClick={() => setActiveTab('following')} 
                    className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === 'following' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}>
                    Following
                    {activeTab === 'following' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full" />}
                </button>
            )}
        </div>



        <div className="mb-8">
          <BlogList type={activeTab} categoryId={selectedCategory} />
        </div>
      </div>
      
      {/* Sidebar */}
      <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
              {/* Category Filter in Sidebar */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 uppercase text-xs tracking-widest">Post Categories</h4>
                  <div className="relative">
                      <select 
                          value={selectedCategory || ''} 
                          onChange={(e) => setSelectedCategory(e.target.value || null)}
                          className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none appearance-none transition-all cursor-pointer"
                      >
                          <option value="">All Topics</option>
                          {categories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                  {cat.name}
                              </option>
                          ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                      </div>
                  </div>
              </div>

              {user ? (
                  <SuggestedUsers />
              ) : (
                  <div className="bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/20">
                      <h3 className="text-xl font-bold mb-3">Join the Platform</h3>
                      <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                          Follow your favorite authors, save interesting stories, and join the discussion today.
                      </p>
                      <Link to="/signup" className="block w-full text-center py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                          Get Started
                      </Link>
                  </div>
              )}
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm opacity-75">
                  <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-gray-900 dark:text-white">Code Playground</h4>
                      <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full">Coming Soon</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Try our new interactive coding sandbox! Write, compile, and run code in multiple languages.
                  </p>
                  <div className="text-sm font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed">
                      Go to Playground →
                  </div>
              </div>
          </div>
      </aside>
    </div>
  );
};
