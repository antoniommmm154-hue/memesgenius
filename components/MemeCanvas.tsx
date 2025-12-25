
import React, { useRef, useEffect } from 'react';

interface MemeCanvasProps {
  imageUrl: string;
  topText: string;
  bottomText: string;
  fontSize: number;
  textColor: string;
}

const MemeCanvas: React.FC<MemeCanvasProps> = ({ imageUrl, topText, bottomText, fontSize, textColor }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-xl border-4 border-slate-700 bg-slate-800 shadow-2xl"
      style={{ minHeight: '300px' }}
    >
      <img 
        src={imageUrl} 
        alt="Meme base" 
        className="w-full h-auto block"
        crossOrigin="anonymous"
      />
      
      {/* Top Text Overlay */}
      <div 
        className="absolute top-4 left-0 right-0 px-4 text-center pointer-events-none"
        style={{ fontSize: `${fontSize}px`, color: textColor }}
      >
        <span className="impact-text break-words block drop-shadow-lg">
          {topText}
        </span>
      </div>

      {/* Bottom Text Overlay */}
      <div 
        className="absolute bottom-4 left-0 right-0 px-4 text-center pointer-events-none"
        style={{ fontSize: `${fontSize}px`, color: textColor }}
      >
        <span className="impact-text break-words block drop-shadow-lg">
          {bottomText}
        </span>
      </div>
    </div>
  );
};

export default MemeCanvas;
