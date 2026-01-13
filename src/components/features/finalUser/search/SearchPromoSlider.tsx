"use client";

import React from "react";

export default function SearchPromoSlider() {
  return (
    <div className="w-full flex flex-col items-center gap-[15px] mb-6 md:hidden">
      {/* Slider Container - Left aligned initially but centered scroll */}
      <div className="w-full overflow-x-auto no-scrollbar flex items-center px-4 gap-3 snap-x snap-mandatory">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[340px] md:w-[363px] h-[120px] bg-[#D1D1D6] rounded-[6px] snap-center relative flex items-center justify-center"
          >
            {/* Simple visual cue for the 'R' pin seen in screenshot, purely decorative */}
            <div className="w-[32px] h-[40px] relative">
              {/* Pin Shape Mock */}
              <div className="absolute top-0 left-0 w-full h-[32px] bg-[#108c4a] rounded-full flex items-center justify-center z-10">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-[#108c4a]"></div>
            </div>
          </div>
        ))}
        {/* Peek effect spacer */}
        <div className="w-2 flex-shrink-0"></div>
      </div>

      {/* Pagination Dots */}
      {/* Group 1000001007 from Figma */}
      <div className="flex items-center gap-[5px]">
        {/* Dot 1 - Gray */}
        <div className="w-[10.5px] h-[5px] rounded-[10px] bg-[#D5DEE7]"></div>
        {/* Dot 2 - Yellow (Active based on Figma 'Rectangle 1227') */}
        <div className="w-[10.5px] h-[5px] rounded-[10px] bg-[#FFCF58]"></div>
        {/* Dot 3 - Gray */}
        <div className="w-[10.5px] h-[5px] rounded-[10px] bg-[#D5DEE7]"></div>
      </div>
    </div>
  );
}
