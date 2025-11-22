import React from "react";

interface IconProps {
  className?: string;
  fill?: string;
}

export default function AdminBannerIcon({ className }: IconProps) {
  return (
    <svg
      width="17"
      height="12"
      viewBox="0 0 17 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0 1.66667C0 0.746192 0.746193 0 1.66667 0H15C15.9205 0 16.6667 0.746191 16.6667 1.66667V10C16.6667 10.9205 15.9205 11.6667 15 11.6667H1.66667C0.746192 11.6667 0 10.9205 0 10V1.66667ZM1.66667 5V10H15V5H1.66667ZM15 3.33333H1.66667V1.66667H15V3.33333ZM2.5 7.5C2.5 7.03976 2.8731 6.66667 3.33333 6.66667H5C5.46024 6.66667 5.83333 7.03976 5.83333 7.5C5.83333 7.96024 5.46024 8.33333 5 8.33333H3.33333C2.8731 8.33333 2.5 7.96024 2.5 7.5ZM6.66667 7.5C6.66667 7.03976 7.03976 6.66667 7.5 6.66667H11.6667C12.1269 6.66667 12.5 7.03976 12.5 7.5C12.5 7.96024 12.1269 8.33333 11.6667 8.33333H7.5C7.03976 8.33333 6.66667 7.96024 6.66667 7.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
