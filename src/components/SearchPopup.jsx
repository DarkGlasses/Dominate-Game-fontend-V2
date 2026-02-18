import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../service/api';

const SearchPopup = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');

  const [apiData, setApiData] = useState({
    games: [],
    news: [],
    community: []
  });
  
  const [selectedGame, setSelectedGame] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [gamesRes, newsRes, communityRes] = await Promise.all([
          api.get('/games'),
          api.get('/news'),
          api.get('/community')
        ]);

        setApiData({
          games: gamesRes.data.status === 'success' ? gamesRes.data.data : [],
          news: newsRes.data.status === 'success' ? newsRes.data.data : [],
          community: communityRes.data.status === 'success' ? communityRes.data.data : []
        });

      } catch (err) {
        console.error("Error fetching search data:", err);
      }
    };
    fetchAllData();
  }, []);
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    let results = [];

    if (filterCategory === 'all' || filterCategory === 'game') {
      const games = apiData.games.filter(game => {
        const genreStr = typeof game.genre === 'string' ? game.genre : JSON.stringify(game.genre);
        return (
          game.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          genreStr.toLowerCase().includes(lowerCaseSearchTerm)
        );
      }).map(game => ({ 
        ...game, 
        type: 'game',
        name: game.title, 
        desc: typeof game.genre === 'object' ? Object.values(game.genre).join(', ') : game.genre 
      }));
      results = [...results, ...games];
    }

    if (filterCategory === 'all' || filterCategory === 'news') {
      const news = apiData.news.filter(news =>
        news.headline.toLowerCase().includes(lowerCaseSearchTerm) || 
        news.content.toLowerCase().includes(lowerCaseSearchTerm)
      ).map(news => ({ 
        ...news, 
        type: 'news',
        name: news.headline,
        desc: news.content 
      }));
      results = [...results, ...news];
    }

    if (filterCategory === 'all' || filterCategory === 'community') {
      const posts = apiData.community.filter(post => 
        post.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        post.content.toLowerCase().includes(lowerCaseSearchTerm) ||
        (post.user?.username && post.user.username.toLowerCase().includes(lowerCaseSearchTerm))
      ).map(post => ({ 
        ...post, 
        type: 'community',
        name: post.title,
        desc: post.content
      }));
      results = [...results, ...posts];
    }

    setSearchResults(results);

  }, [searchTerm, filterCategory, apiData]);

  const handleResultClick = (result) => {
    if (result.type === 'news') {
      onClose();
      navigate(`/news/${result.id}`); 
      
    } else if (result.type === 'game') {
      setSelectedGame(result);
      
    } else if (result.type === 'community') {
      onClose();
      navigate(`/community/${result.id}`);
    }
  };

  if (selectedGame) return <GamePopup game={selectedGame} onClose={() => setSelectedGame(null)} />;

  const FilterButton = ({ label, value, icon }) => (
    <button
      onClick={() => setFilterCategory(value)}
      className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
        filterCategory === value 
          ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' 
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
      }`}
    >
      <i className={`bi ${icon}`}></i> {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-start pt-20 z-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 p-6 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 relative border border-zinc-800 flex flex-col max-h-[85vh]">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-2xl">
          <i className="bi bi-x-lg"></i>
        </button>

        <h2 className="text-2xl font-bold text-red-600 mb-6 flex items-center gap-2">
          <i className="bi bi-search"></i> SEARCH
        </h2>

        <div className="mb-4 relative shrink-0">
          <input
            type="text"
            className="w-full p-4 pl-12 rounded-xl bg-black border border-zinc-700 text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all text-lg"
            placeholder={`Search in ${filterCategory === 'all' ? 'everything' : filterCategory}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl"></i>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar shrink-0">
          <FilterButton label="All" value="all" icon="bi-grid-fill" />
          <FilterButton label="Games" value="game" icon="bi-controller" />
          <FilterButton label="News" value="news" icon="bi-newspaper" />
          <FilterButton label="Community" value="community" icon="bi-chat-quote-fill" />
        </div>

        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1">
          {searchTerm.length > 0 ? (
            searchResults.length > 0 ? (
              <ul className="space-y-2">
                {searchResults.map((result, index) => (
                  <li
                    key={`${result.type}-${index}`}
                    className="bg-zinc-800/40 p-3 rounded-xl cursor-pointer hover:bg-zinc-800 hover:border-l-4 hover:border-red-600 transition-all flex items-center gap-4 group"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/50 shrink-0">
                      {result.type === 'game' && <i className="bi bi-controller text-red-500 text-xl"></i>}
                      {result.type === 'news' && <i className="bi bi-newspaper text-blue-500 text-xl"></i>}
                      {result.type === 'community' && <i className="bi bi-chat-quote-fill text-orange-500 text-xl"></i>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className="text-white font-bold text-md truncate group-hover:text-red-500 transition-colors">
                            {result.name}
                        </h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ml-2 shrink-0 ${
                            result.type === 'game' ? 'bg-green-900/30 text-green-400' :
                            result.type === 'news' ? 'bg-blue-900/30 text-blue-400' :
                            'bg-orange-900/30 text-orange-400'
                        }`}>
                            {result.type}
                        </span>
                      </div>
                      
                      <p className="text-zinc-400 text-xs truncate">
                        {result.desc}
                      </p>

                      {result.type === 'community' && result.user && (
                        <p className="text-[10px] text-zinc-600 mt-1">
                          By: {result.user.username}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 text-zinc-500">
                <i className="bi bi-emoji-frown text-4xl mb-3 block opacity-50"></i>
                <p>No results found in "{filterCategory}"</p>
              </div>
            )
          ) : (
            <div className="text-center py-12 text-zinc-600">
              <i className="bi bi-search text-4xl mb-3 block opacity-30"></i>
              <p>Type to search...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;