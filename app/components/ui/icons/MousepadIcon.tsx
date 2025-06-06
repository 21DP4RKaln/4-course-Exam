import React from 'react';

interface MousepadIconProps {
  size?: number;
  className?: string;
}

export const MousepadIcon: React.FC<MousepadIconProps> = ({
  size = 24,
  className = '',
}) => {
  return (
    <svg
      fill="currentColor"
      height={size}
      width={size}
      version="1.1"
      id="Capa_1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 474.792 474.792"
      xmlSpace="preserve"
      className={className}
    >
      <g>
        <path d="M407.776,0H67.016C30.063,0,0,30.063,0,67.016v340.759c0,36.953,30.063,67.016,67.016,67.016h340.759 c36.953,0,67.016-30.063,67.016-67.016V67.016C474.792,30.063,444.728,0,407.776,0z M442.94,407.776 c0,19.395-15.778,35.164-35.164,35.164H67.016c-19.387,0-35.165-15.77-35.165-35.164V67.016c0-19.395,15.778-35.164,35.165-35.164 h44.722c4.55,50.157,46.782,89.583,98.091,89.583h42.202c33.042,0,59.924,26.875,59.924,59.924v4.65 c3.919-0.513,7.885-0.871,11.944-0.871c4.06,0,8.025,0.358,11.945,0.871v-4.65c0-46.207-37.598-83.813-83.813-83.813h-42.202 c-38.096,0-69.263-28.788-73.743-65.694h271.69c19.387,0,35.164,15.77,35.164,35.164V407.776z"></path>
        <path d="M323.9,201.065c-41.347,0-74.863,33.516-74.863,74.871v54.309c0,41.355,33.516,74.871,74.863,74.871 s74.863-33.516,74.863-74.871v-54.309C398.763,234.581,365.247,201.065,323.9,201.065z M339.826,278.704 c0,8.802-7.132,15.926-15.926,15.926c-8.796,0-15.926-7.124-15.926-15.926v-38.819c0-8.802,7.13-15.926,15.926-15.926 c8.794,0,15.926,7.124,15.926,15.926V278.704z"></path>
      </g>
    </svg>
  );
};

export default MousepadIcon;
