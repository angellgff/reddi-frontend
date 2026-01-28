"use client";

import React from "react";
import { ProductTagDefinition } from "@/src/lib/partner/productTypes";
import { TagIcon } from "@/src/components/ui/TagIconHelper";
import { cn } from "@/src/lib/utils";

interface TagSelectorProps {
  availableTags: ProductTagDefinition[];
  selectedTags: string[];
  onChange: (newTags: string[]) => void;
}

export default function TagSelector({
  availableTags,
  selectedTags,
  onChange,
}: TagSelectorProps) {
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((t) => t !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
  };

  if (!availableTags || availableTags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {availableTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id);
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50",
            )}
          >
            <TagIcon
              iconKey={tag.iconKey}
              color={isSelected ? "currentColor" : tag.color || "#666"}
              size={16}
            />
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
