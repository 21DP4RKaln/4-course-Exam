import React from 'react';

interface GpuIconProps {
  size?: number;
  className?: string;
}

const GpuIcon: React.FC<GpuIconProps> = ({ size = 24, className = '' }) => {
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
      className={`lucide lucide-gpu-icon lucide-gpu ${className}`}
    >
      <path d="M2 21V3" />
      <path d="M2 5h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2.26" />
      <path d="M7 17v3a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-3" />
      <circle cx="16" cy="11" r="2" />
      <circle cx="8" cy="11" r="2" />
    </svg>
  );
};

export default GpuIcon;
