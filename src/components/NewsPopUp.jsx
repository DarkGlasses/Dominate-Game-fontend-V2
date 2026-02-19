import React, { useState, useEffect } from 'react';

const NewsPopUp = ({ newsItem, onClose }) => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setShowPopup(true);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    setTimeout(onClose, 300);
  };

  if (!newsItem) return null;

  const getImageUrl = (imgName) => {
    if (!imgName) return "https://via.placeholder.com/800x400?text=No+Image";
    return `${import.meta.env.VITE_API_URL}/images/${imgName}`;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      <div 
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${showPopup ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      ></div>

      <div className={`
          bg-zinc-900 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl relative flex flex-col overflow-hidden border border-zinc-700
          transform transition-all duration-300 ${showPopup ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
      `}>

        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
        >
          ✕
        </button>

        <div className="w-full h-64 md:h-80 flex-shrink-0 bg-black">
          <img 
            src={getImageUrl(newsItem.image || newsItem.picture)} 
            alt={newsItem.title} 
            className="w-full h-full object-cover opacity-90"
          />
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">{newsItem.title}</h2>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6 border-b border-gray-800 pb-4">
            {newsItem.author && <span>By: <span className="text-white">{newsItem.author}</span></span>}
            <span>Date: {new Date(newsItem.createdAt || Date.now()).toLocaleDateString('th-TH')}</span>
          </div>

          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
            {newsItem.content || newsItem.summary}
          </p>

          <div className="mt-8 pt-4 flex justify-end">
            <button
              onClick={handleClose}
              className="bg-red-800 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              Close News
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsPopUp;