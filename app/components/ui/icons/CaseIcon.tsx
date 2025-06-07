import React from 'react';

interface CaseIconProps {
  size?: number;
  className?: string;
}

const CaseIcon: React.FC<CaseIconProps> = ({ size = 24, className = '' }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-pc-case-icon lucide-pc-case ${className}`}
    >
      <rect width="14" height="20" x="5" y="2" rx="2" />
      <path d="M15 14h.01" />
      <path d="M9 6h6" />
      <path d="M9 10h6" />
    </svg>
  );
};

export default CaseIcon;
