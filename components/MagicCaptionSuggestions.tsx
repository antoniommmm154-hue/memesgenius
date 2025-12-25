
import React from 'react';
import { CaptionSuggestion } from '../types';
import { Sparkles } from 'lucide-react';

interface MagicCaptionSuggestionsProps {
  suggestions: CaptionSuggestion[];
  onSelect: (text: string) => void;
  isLoading: boolean;
}

const MagicCaptionSuggestions: React.FC<MagicCaptionSuggestionsProps> = ({ suggestions, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 space-x-3 bg-slate-800/50 rounded-xl border border-dashed border-emerald-500/50">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
        <p className="text-emerald-300 font-medium italic">Gemini is brainstorming funny ideas...</p>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center space-x-2 text-emerald-400 mb-2">
        <Sparkles size={20} />
        <h3 className="font-bold text-lg">AI Suggestions</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(suggestion.text)}
            className="text-left p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 transition-all rounded-xl group relative overflow-hidden"
          >
            <p className="text-white font-semibold mb-1 group-hover:text-emerald-300 transition-colors">
              "{suggestion.text}"
            </p>
            <p className="text-xs text-slate-400 line-clamp-1 italic">
              {suggestion.explanation}
            </p>
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100">
              <Sparkles size={14} className="text-emerald-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MagicCaptionSuggestions;
