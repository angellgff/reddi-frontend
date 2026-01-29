export default function NdProfileIcon({
  className,
  color = "#171725",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      width="19"
      height="24"
      viewBox="0 0 19 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M18 23C18 18.2749 14.1944 14.4444 9.5 14.4444C4.80558 14.4444 1 18.2749 1 23M9.5 10.7778C6.81747 10.7778 4.64286 8.58895 4.64286 5.88889C4.64286 3.18883 6.81747 1 9.5 1C12.1825 1 14.3571 3.18883 14.3571 5.88889C14.3571 8.58895 12.1825 10.7778 9.5 10.7778Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
