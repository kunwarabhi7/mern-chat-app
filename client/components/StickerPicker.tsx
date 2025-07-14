import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sticker } from "lucide-react";
import Image from "next/image";

interface StickerPickerProps {
  onSelect: (sticker: string) => void;
}

const stickers = [
  "/stickers/smile.png",
  "/stickers/heart.png",
  "/stickers/thumbsup.png",
];

export function StickerPicker({ onSelect }: StickerPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Sticker className="h-4 w-4 text-blue-500 dark:text-blue-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-2">
          {stickers.map((sticker, index) => (
            <Button
              key={index}
              variant="ghost"
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => onSelect(sticker)}
            >
              <Image
                src={sticker}
                alt="Sticker"
                width={40}
                height={40}
                className="hover:scale-105 transition-transform duration-200"
              />
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
