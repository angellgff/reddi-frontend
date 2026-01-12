// src/components/icons/IconAward.tsx

import React from "react";

interface IconProps {
  className?: string;
  fill?: string;
  stroke?: string;
}

export default function UserCarIcon({ className, fill, stroke }: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 1L3.77778 1L4.33333 3.22222M4.33333 3.22222L6.55556 12.1111M4.33333 3.22222H21L18.7778 12.1111H6.55556M6.55556 12.1111H6C5.07953 12.1111 4.33333 12.8573 4.33333 13.7778C4.33333 14.6983 5.07953 15.4444 6 15.4444H18.7778M18.5876 16.8889C18.5876 17.5025 18.0901 18 17.4765 18C16.8628 18 16.3654 17.5025 16.3654 16.8889C16.3654 16.2752 16.8628 15.7778 17.4765 15.7778C18.0901 15.7778 18.5876 16.2752 18.5876 16.8889ZM7.47647 16.8889C7.47647 17.5025 6.97901 18 6.36536 18C5.75171 18 5.25425 17.5025 5.25425 16.8889C5.25425 16.2752 5.75171 15.7778 6.36536 15.7778C6.97901 15.7778 7.47647 16.2752 7.47647 16.8889Z"
        stroke={stroke || "white"}
        strokeLinecap="round"
        fill={fill || "none"}
      />
    </svg>
  );
}
