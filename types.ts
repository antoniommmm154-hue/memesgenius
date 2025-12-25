
export interface CaptionSuggestion {
  text: string;
  explanation: string;
}

export interface MemeTemplate {
  id: string;
  name: string;
  url: string;
}

export interface MemeState {
  imageUrl: string | null;
  topText: string;
  bottomText: string;
  fontSize: number;
  textColor: string;
  isMagicLoading: boolean;
  isEditLoading: boolean;
  suggestions: CaptionSuggestion[];
}
