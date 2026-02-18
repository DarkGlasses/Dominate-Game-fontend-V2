import React, { useState, useEffect } from "react";
import api from "../service/api";
import { useNavigate } from "react-router-dom";

const Game = () => {
  const navigate = useNavigate();
  
  const [allGames, setAllGames] = useState([]);
  
  const [filteredGames, setFilteredGames] = useState([]);
  
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get("/games"); 
        if (response.data && Array.isArray(response.data.data)) {
          setAllGames(response.data.data);      
          setFilteredGames(response.data.data);  
        }
      } catch (error) {
        console.error("Error fetching all games:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => {
    let result = [...allGames]; 

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter((game) => {
        const matchTitle = game.title.toLowerCase().includes(lowerTerm);
        const matchDev = game.developer && game.developer.toLowerCase().includes(lowerTerm);

        let matchGenre = false;
        if (Array.isArray(game.genre)) {
          matchGenre = game.genre.some(g => g.toLowerCase().includes(lowerTerm));
        } else if (typeof game.genre === 'string') {
          matchGenre = game.genre.toLowerCase().includes(lowerTerm);
        }

        return matchTitle || matchDev || matchGenre;
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.releaseDate || 0) - new Date(a.releaseDate || 0);
        case "oldest":
          return new Date(a.releaseDate || 0) - new Date(b.releaseDate || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name_asc":
          return a.title.localeCompare(b.title);
        case "name_desc":
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

    setFilteredGames(result); 

  }, [searchTerm, sortBy, allGames]); 

  // ฟังก์ชันสำหรับไปหน้า Detail
  const handleViewDetail = (id) => {
    navigate(`/game/${id}`);
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return "https://via.placeholder.com/400x300?text=No+Image";
    let cleanPath = imgPath.replace(/\\/g, "/");
    cleanPath = cleanPath.split("images/").pop();
    return `http://localhost:4000/images/${cleanPath}`;
  };

  if (loading) return <div className="text-white p-20 text-center text-2xl">Loading all games...</div>;

  return (
    <div className="text-white flex flex-col pt-[120px] md:pt-10 md:ml-10 mt-6 space-y-10 min-h-screen bg-black">
      <section className="px-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            Explore All <span className="text-red-800">GAMES</span>
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="relative w-full sm:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search games..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-zinc-900 border border-zinc-700 text-white px-4 py-3 pl-10 rounded-xl focus:outline-none focus:border-red-600 w-full sm:w-64 transition-colors"
                    />
                    <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"></i>
                </div>

                <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-zinc-900 border border-zinc-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 cursor-pointer appearance-none"
                >
                    <option value="newest">Newest Release</option>
                    <option value="oldest">Oldest Release</option>
                    <option value="rating">Highest Rating</option>
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                </select>
            </div>
        </div>

        {filteredGames.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 text-lg">
                No games found matching "{searchTerm}"
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
              {filteredGames.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleViewDetail(card.id)}
                  className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] border border-zinc-800 group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getImageUrl(card.picture)}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Error";
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-red-700 text-xs font-bold px-2 py-1 rounded shadow-md">
                      {card.rating ? `${card.rating}/10` : 'N/A'}
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="text-xl font-bold mb-1 truncate text-white group-hover:text-red-500 transition-colors">
                      {card.title}
                    </h2>
                    
                    <div className="flex flex-wrap gap-2 mb-6 min-h-[24px]">
                      {card?.genre ? (
                        (Array.isArray(card.genre)
                          ? card.genre
                          : typeof card.genre === "string"
                            ? card.genre.split(",") 
                            : []
                        ).slice(0, 3).map((g, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded text-[10px] font-bold uppercase tracking-wider"
                          >
                            {typeof g === "string" ? g.trim() : g}
                          </span>
                        ))
                      ) : (
                        <span className="text-zinc-600 text-xs italic">No genre</span>
                      )}
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-800 pt-3 mt-auto">
                      <span className="text-xs text-zinc-400 font-mono">
                        {card.releaseDate ? new Date(card.releaseDate).getFullYear() : 'TBA'}
                      </span>
                      <button className="text-red-600 text-xs font-bold uppercase flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        View Detail <i className="bi bi-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
      </section>

    </div>
  );
};

export default Game;