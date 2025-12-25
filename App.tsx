
import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Sparkles, 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  Type as FontIcon, 
  Palette,
  Wand2,
  RefreshCw,
  Camera as CameraIcon
} from 'lucide-react';
import MemeCanvas from './components/MemeCanvas';
import MagicCaptionSuggestions from './components/MagicCaptionSuggestions';
import CameraCapture from './components/CameraCapture';
import { TRENDING_TEMPLATES, DEFAULT_FONT_SIZE, MAX_FONT_SIZE, MIN_FONT_SIZE } from './constants';
import { getMagicCaptions, editMemeImage } from './services/geminiService';
import { CaptionSuggestion } from './types';

const App: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>(TRENDING_TEMPLATES[0].url);
  const [topText, setTopText] = useState<string>('Me when');
  const [bottomText, setBottomText] = useState<string>('I find a new bug');
  const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [suggestions, setSuggestions] = useState<CaptionSuggestion[]>([]);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [aiEditPrompt, setAiEditPrompt] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [autoMagic, setAutoMagic] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setSuggestions([]); 
      };
      reader.readAsDataURL(file);
    }
  };

  const getBase64FromUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const runMagicOnImage = async (base64Data: string) => {
    setIsMagicLoading(true);
    try {
      const results = await getMagicCaptions(base64Data);
      setSuggestions(results);
      if (results.length > 0) {
        setBottomText(results[0].text);
      }
    } catch (error) {
      console.error("Magic capture failed:", error);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleMagicCaption = async () => {
    setIsMagicLoading(true);
    try {
      const base64 = imageUrl.startsWith('data:') 
        ? imageUrl.split(',')[1] 
        : await getBase64FromUrl(imageUrl);
      
      const results = await getMagicCaptions(base64);
      setSuggestions(results);
    } catch (error) {
      alert("Failed to generate magic captions. Please try again.");
    } finally {
      setIsMagicLoading(false);
    }
  };

  const handleCameraCapture = (dataUrl: string) => {
    setImageUrl(dataUrl);
    setShowCamera(false);
    setSuggestions([]);
    if (autoMagic) {
      runMagicOnImage(dataUrl.split(',')[1]);
    }
  };

  const handleAiEdit = async () => {
    if (!aiEditPrompt.trim()) return;
    setIsEditLoading(true);
    try {
      const base64 = imageUrl.startsWith('data:') 
        ? imageUrl.split(',')[1] 
        : await getBase64FromUrl(imageUrl);
      
      const editedImageUrl = await editMemeImage(base64, aiEditPrompt);
      setImageUrl(editedImageUrl);
      setAiEditPrompt('');
    } catch (error) {
      alert("AI Image Edit failed. Please try a different prompt.");
    } finally {
      setIsEditLoading(false);
    }
  };

  const downloadMeme = async () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'my-awesome-meme.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
            <Wand2 className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            MemeGenius AI
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowCamera(true)}
            className="group flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700 relative overflow-hidden"
          >
            {/* Pulsing Green Light to indicate readiness/no problem */}
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <CameraIcon size={18} />
            <span>Image Capture</span>
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors border border-slate-700"
          >
            <Upload size={18} />
            <span>Upload</span>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
        </div>
      </header>

      {showCamera && (
        <CameraCapture 
          onCapture={handleCameraCapture} 
          onClose={() => setShowCamera(false)} 
          autoMagic={autoMagic}
          setAutoMagic={setAutoMagic}
        />
      )}

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <MemeCanvas 
            imageUrl={imageUrl} 
            topText={topText} 
            bottomText={bottomText} 
            fontSize={fontSize} 
            textColor={textColor}
          />

          <button
            onClick={handleMagicCaption}
            disabled={isMagicLoading}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            {isMagicLoading ? (
              <RefreshCw className="animate-spin" size={24} />
            ) : (
              <Sparkles size={24} />
            )}
            <span>{isMagicLoading ? 'Gemini is Thinking...' : 'Magic Caption Suggestion'}</span>
          </button>

          <MagicCaptionSuggestions 
            suggestions={suggestions} 
            isLoading={isMagicLoading}
            onSelect={(text) => setBottomText(text)} 
          />

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <div className="flex items-center space-x-2 text-emerald-400 mb-4">
              <RefreshCw size={20} />
              <h3 className="font-bold text-lg">AI Image Remaster</h3>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Ask AI to edit the image (e.g., "Add pixel art style", "Put a crown on their head", "Make it look like a oil painting").
            </p>
            <div className="flex space-x-2">
              <input
                type="text"
                value={aiEditPrompt}
                onChange={(e) => setAiEditPrompt(e.target.value)}
                placeholder="e.g. Add a rainy night atmosphere..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleAiEdit}
                disabled={isEditLoading || !aiEditPrompt}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                {isEditLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl sticky top-8">
            <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
              <FontIcon className="text-emerald-400" size={20} />
              <span>Customize Meme</span>
            </h2>

            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Top Text</label>
                  <input 
                    type="text" 
                    value={topText} 
                    onChange={(e) => setTopText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Bottom Text</label>
                  <textarea 
                    rows={2}
                    value={bottomText} 
                    onChange={(e) => setBottomText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center space-x-1">
                    <FontIcon size={14} />
                    <span>Font Size</span>
                  </label>
                  <input 
                    type="range" 
                    min={MIN_FONT_SIZE} 
                    max={MAX_FONT_SIZE} 
                    value={fontSize} 
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="text-right text-xs text-slate-500 mt-1">{fontSize}px</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center space-x-1">
                    <Palette size={14} />
                    <span>Color</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="color" 
                      value={textColor} 
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 bg-transparent border-none cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 uppercase">{textColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center space-x-1">
                  <ImageIcon size={14} />
                  <span>Trending Templates</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TRENDING_TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setImageUrl(tpl.url)}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        imageUrl === tpl.url ? 'border-emerald-500' : 'border-transparent hover:border-slate-600'
                      }`}
                    >
                      <img src={tpl.url} alt={tpl.name} className="object-cover w-full h-full" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={downloadMeme}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
                >
                  <Download size={20} />
                  <span>Download Meme</span>
                </button>
                <button 
                  onClick={() => {
                    setTopText('');
                    setBottomText('');
                    setSuggestions([]);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-slate-700"
                >
                  <Trash2 size={18} />
                  <span>Reset Text</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-12 pb-8 text-center text-slate-500 text-sm border-t border-slate-900 pt-8">
        <p>Powered by Google Gemini 3 Pro & 2.5 Flash Image • Built by MemeGenius AI Team</p>
      </footer>
    </div>
  );
};

export default App;
