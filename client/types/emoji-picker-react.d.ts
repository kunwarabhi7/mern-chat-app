// src/types/emoji-picker-react.d.ts
declare module "emoji-picker-react" {
  import * as React from "react";

  export interface EmojiClickData {
    emoji: string;
    unified: string;
    names: string[];
    activeSkinTone: string;
    unifiedWithoutSkinTone: string;
    getImageUrl: (emojiStyle: string) => string;
  }

  export interface EmojiPickerProps {
    onEmojiClick?: (emojiData: EmojiClickData, event: MouseEvent) => void;
    theme?: "light" | "dark" | "auto";
    emojiStyle?: "native" | "apple" | "google" | "twitter" | "facebook";
    previewConfig?: { showPreview: boolean };
    skinTonePickerLocation?: "SEARCH" | "PREVIEW";
    width?: number | string;
    height?: number | string;
    [key: string]: any;
  }

  const EmojiPicker: React.FC<EmojiPickerProps>;
  export default EmojiPicker;
}
