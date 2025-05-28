import React from 'react'
import styled from 'styled-components'

interface ScrollAreaProps {
  className?: string
  children: React.ReactNode
  theme?: 'light' | 'dark'
  maxHeight?: string
}

const ScrollContainer = styled.div<{ $maxHeight?: string, $theme?: string }>`
  overflow-y: auto;
  height: ${props => props.$maxHeight || '100%'};
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${props => props.$theme === 'dark' ? 'rgba(185, 28, 28, 0.5)' : 'rgba(59, 130, 246, 0.5)'};
    border-radius: 20px;
    border: none;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: ${props => props.$theme === 'dark' ? 'rgba(220, 38, 38, 0.8)' : 'rgba(37, 99, 235, 0.8)'};
  }
  
  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${props => props.$theme === 'dark' ? 'rgba(185, 28, 28, 0.5) transparent' : 'rgba(59, 130, 246, 0.5) transparent'};
`

const ScrollArea: React.FC<ScrollAreaProps> = ({ 
  children, 
  className,
  theme = 'light',
  maxHeight
}) => {
  return (
    <ScrollContainer 
      className={className} 
      $theme={theme}
      $maxHeight={maxHeight}
    >
      {children}
    </ScrollContainer>
  )
}

export default ScrollArea
