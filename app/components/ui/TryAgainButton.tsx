import React from 'react';
import styled from 'styled-components';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/app/contexts/ThemeContext';

interface CustomButtonProps {
  onClick?: () => void;
  children?: React.ReactNode;
  beforeText?: string;
  afterText?: string;
  className?: string;
}

interface StyledWrapperProps {
  $isDark: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  onClick,
  children,
  beforeText,
  afterText,
  className = '',
}) => {
  const t = useTranslations();
  const { resolvedTheme } = useTheme();

  const defaultBeforeText = beforeText || t('common.tryAgain');
  const defaultAfterText = afterText || t('common.sorry');

  return (
    <StyledWrapper $isDark={resolvedTheme === 'dark'} className={className}>
      <button
        className="button type1"
        onClick={onClick}
        data-before={defaultBeforeText}
        data-after={defaultAfterText}
      >
        {children}
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div<StyledWrapperProps>`
  .button {
    height: 50px;
    width: 150px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.5s ease-in-out;
  }

  .button:hover {
    box-shadow: ${props =>
      props.$isDark
        ? '0.5px 0.5px 150px rgba(220, 38, 38, 0.3)'
        : '0.5px 0.5px 150px rgba(59, 130, 246, 0.3)'};
  }

  .type1::after {
    content: attr(data-after);
    height: 50px;
    width: 150px;
    background-color: ${props =>
      props.$isDark
        ? 'rgb(220 38 38)' /* Red for dark mode */
        : 'rgb(59 130 246)'}; /* Blue for light mode */
    color: #fff;
    position: absolute;
    top: 0%;
    left: 0%;
    transform: translateY(50px);
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.5s ease-in-out;
  }

  .type1::before {
    content: attr(data-before);
    height: 50px;
    width: 150px;
    background-color: ${props =>
      props.$isDark ? 'rgb(41 37 36)' /* Dark background */ : '#fff'};
    color: ${props =>
      props.$isDark
        ? 'rgb(220 38 38)' /* Red text for dark mode */
        : 'rgb(59 130 246)'}; /* Blue text for light mode */
    position: absolute;
    top: 0%;
    left: 0%;
    transform: translateY(0px) scale(1.2);
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.5s ease-in-out;
  }

  .type1:hover::after {
    transform: translateY(0) scale(1.2);
  }

  .type1:hover::before {
    transform: translateY(-50px) scale(0) rotate(120deg);
  }
`;

export default CustomButton;
