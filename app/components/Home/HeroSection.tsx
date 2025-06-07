'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/app/contexts/ThemeContext';
import { Cpu, Monitor, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function HeroSection() {
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname.split('/')[1];
  const { theme } = useTheme();
  const [imageSrc, setImageSrc] = useState('/images/dark-pc.png');

  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.9]);
  const translateY = useTransform(scrollY, [0, 300], [0, -50]);

  useEffect(() => {
    if (theme === 'dark') {
      const randomDarkImage =
        Math.random() < 0.5 ? '/images/dark-pc.png' : '/images/dark-pc2.png';
      setImageSrc(randomDarkImage);
    }
    if (theme === 'light') {
      const randomLightImage =
        Math.random() < 0.5 ? '/images/light-pc.png' : '/images/light-pc2.png';
      setImageSrc(randomLightImage);
    }
  }, [theme]);
  return (
    <section
      className={`relative min-h-[85vh] w-full flex flex-col justify-center overflow-hidden ${theme === 'dark' ? 'bg-black' : 'bg-neutral-100'}`}
    >
      {/* Background image with gradient overlay based on theme */}
      <div className="absolute inset-0 z-0">
        {theme === 'dark' ? (
          <motion.div
            className="absolute inset-0 z-0 flex justify-end"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              x: useTransform(scrollY, [0, 300], [0, 50]),
            }}
          >
            <div className="relative w-1/2 h-full md:block hidden">
              <Image
                src={imageSrc}
                alt="Dark PC"
                fill
                className="object-right"
                priority
              />
            </div>
            <div className="relative w-full h-full md:hidden">
              <Image
                src={imageSrc}
                alt="Dark PC Mobile"
                fill
                className="object-contain object-right-bottom opacity-30"
                priority
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="absolute inset-0 z-0 flex justify-end"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              x: useTransform(scrollY, [0, 300], [0, 50]),
            }}
          >
            <div className="relative w-1/2 h-full md:block hidden">
              <Image
                src={imageSrc}
                alt="Light PC"
                fill
                className="object-right"
                priority
              />
            </div>
            <div className="relative w-full h-full md:hidden">
              <Image
                src={imageSrc}
                alt="Light PC Mobile"
                fill
                className="object-contain object-right-bottom opacity-30"
                priority
              />
            </div>
          </motion.div>
        )}

        {/* Gradient overlay */}
        <motion.div
          className={`absolute inset-0 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-black/70 to-brand-red-800/50'
              : 'bg-gradient-to-r from-white/70 to-brand-blue-600/50'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          style={{
            opacity: useTransform(scrollY, [0, 300], [1, 0.7]),
            backgroundPosition: useTransform(
              scrollY,
              [0, 300],
              ['0% 0%', '10% 0%']
            ),
          }}
        />
      </div>
      {/* Hero content */}
      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-16 md:pt-0 w-full max-w-full">
        <motion.div
          className="max-w-3xl w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ opacity, scale, y: translateY }}
        >
          <motion.h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-neutral-900'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {t('nav.Name')}
          </motion.h1>

          <motion.p
            className={`text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 ${
              theme === 'dark' ? 'text-neutral-200' : 'text-neutral-700'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {t('nav.Info')}
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-4 w-full max-w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            style={{
              y: useTransform(scrollY, [0, 300], [0, -20]),
              opacity: useTransform(scrollY, [0, 300], [1, 0.7]),
            }}
          >
            <StyledWrapper>
              <Link href={`/${locale}/configurator`} className="button">
                <span className="fold" />
                <div className="points_wrapper">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <i className="point" key={i} />
                  ))}
                </div>
                <span className="inner">
                  <Cpu className="icon" />
                  {t('nav.configurator')}
                  <ArrowRight className="icon" />
                </span>
              </Link>
            </StyledWrapper>

            <StyledButtonWrapper
              themeMode={theme}
              style={{ minWidth: '200px' }}
            >
              <Link
                href={`/${locale}/shop/ready-made`}
                className="no-underline w-full"
              >
                <button className="custom-button w-full h-12 flex justify-center items-center">
                  <div className="text">
                    <Monitor className="icon" />
                    {t('nav.readyMade')}
                  </div>
                </button>
              </Link>
            </StyledButtonWrapper>
          </motion.div>
          <motion.div
            className={`flex flex-wrap gap-3 mt-8 md:mt-10 w-full max-w-full overflow-hidden`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            style={{
              y: useTransform(scrollY, [0, 300], [0, -30]),
              opacity: useTransform(scrollY, [0, 200, 300], [1, 0.8, 0.5]),
            }}
          >
            <div
              className={`flex items-center px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm ${
                theme === 'dark'
                  ? 'bg-brand-red-500/20 border border-brand-red-500/40'
                  : 'bg-brand-blue-500/20 border border-brand-blue-500/40'
              }`}
            >
              <div
                className={`w-2 h-1 md:w-2.5 md:h-1.5 rounded-full mr-2 ${
                  theme === 'dark' ? 'bg-brand-red-500' : 'bg-brand-blue-500'
                }`}
              ></div>
              <span
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-neutral-900'
                }`}
              >
                {t('nav.shipping')}
              </span>
            </div>

            <div
              className={`flex items-center px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm ${
                theme === 'dark'
                  ? 'bg-brand-red-500/20 border border-brand-red-500/40'
                  : 'bg-brand-blue-500/20 border border-brand-blue-500/40'
              }`}
            >
              <div
                className={`w-2 h-1 md:w-2.5 md:h-1.5 rounded-full mr-2 ${
                  theme === 'dark' ? 'bg-brand-red-500' : 'bg-brand-blue-500'
                }`}
              ></div>
              <span
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-neutral-900'
                }`}
              >
                {t('nav.warranty')}
              </span>
            </div>

            <div
              className={`flex items-center px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm ${
                theme === 'dark'
                  ? 'bg-brand-red-500/20 border border-brand-red-500/40'
                  : 'bg-brand-blue-500/20 border border-brand-blue-500/40'
              }`}
            >
              <div
                className={`w-2 h-1 md:w-2.5 md:h-1.5 rounded-full mr-2 ${
                  theme === 'dark' ? 'bg-brand-red-500' : 'bg-brand-blue-500'
                }`}
              ></div>
              <span
                className={`font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-neutral-900'
                }`}
              >
                {t('nav.support')}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

const StyledWrapper = styled.div`
  max-width: 100%;
  
  .button {
    --h-button: 48px;
    --w-button: 102px;
    --round: 0.75rem;
    cursor: pointer;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    transition: all 0.25s ease;
    background: radial-gradient(
        65.28% 65.28% at 50% 100%,
        rgba(223, 113, 255, 0.8) 0%,
        rgba(223, 113, 255, 0) 100%
      ),
      linear-gradient(121deg, #d40b11, #5e44c7, #179aeb);
    border-radius: var(--round);
    border: none;
    outline: none;
    padding: 12px 18px;
    max-width: 100%;
  }
  .button::before,
  .button::after {
    content: "";
    position: absolute;
    inset: var(--space);
    transition: all 0.5s ease-in-out;
    border-radius: calc(var(--round) - var(--space));
    z-index: 0;
  }
  .button::before {
    --space: 1px;
    background: linear-gradient(
      177.95deg,
      rgba(255, 255, 255, 0.19) 0%,
      rgba(255, 255, 255, 0) 100%
    );
  }
  .button::after {
    --space: 2px;
    background: transparent;
      linear-gradient(0deg, #7a5af8, #7a5af8);
  }
  .button:active {
    transform: scale(0.95);
  }

  .points_wrapper {
    overflow: hidden;
    width: 100%;
    height: 100%;
    pointer-events: none;
    position: absolute;
    z-index: 1;
  }

  .points_wrapper .point {
    bottom: -10px;
    position: absolute;
    animation: floating-points infinite ease-in-out;
    pointer-events: none;
    width: 2px;
    height: 2px;
    background-color: #fff;
    border-radius: 9999px;
  }
  @keyframes floating-points {
    0% {
      transform: translateY(0);
    }
    85% {
      opacity: 0;
    }
    100% {
      transform: translateY(-55px);
      opacity: 0;
    }
  }
  .points_wrapper .point:nth-child(1) {
    left: 10%;
    opacity: 1;
    animation-duration: 2.35s;
    animation-delay: 0.2s;
  }
  .points_wrapper .point:nth-child(2) {
    left: 30%;
    opacity: 0.7;
    animation-duration: 2.5s;
    animation-delay: 0.5s;
  }
  .points_wrapper .point:nth-child(3) {
    left: 25%;
    opacity: 0.8;
    animation-duration: 2.2s;
    animation-delay: 0.1s;
  }
  .points_wrapper .point:nth-child(4) {
    left: 44%;
    opacity: 0.6;
    animation-duration: 2.05s;
  }
  .points_wrapper .point:nth-child(5) {
    left: 50%;
    opacity: 1;
    animation-duration: 1.9s;
  }
  .points_wrapper .point:nth-child(6) {
    left: 75%;
    opacity: 0.5;
    animation-duration: 1.5s;
    animation-delay: 1.5s;
  }
  .points_wrapper .point:nth-child(7) {
    left: 88%;
    opacity: 0.9;
    animation-duration: 2.2s;
    animation-delay: 0.2s;
  }
  .points_wrapper .point:nth-child(8) {
    left: 58%;
    opacity: 0.8;
    animation-duration: 2.25s;
    animation-delay: 0.2s;
  }
  .points_wrapper .point:nth-child(9) {
    left: 98%;
    opacity: 0.6;
    animation-duration: 2.6s;
    animation-delay: 0.1s;
  }
  .points_wrapper .point:nth-child(10) {
    left: 65%;
    opacity: 1;
    animation-duration: 2.5s;
    animation-delay: 0.2s;
  }

  .inner {
    z-index: 2;
    gap: 6px;
    position: relative;
    width: 100%;
    color: white;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
    transition: color 0.2s ease-in-out;
  }

  .inner svg.icon {
    width: 18px;
    height: 18px;
    transition: fill 0.1s linear;
  }

  .button:focus svg.icon {
    fill: white;
  }
  .button:hover svg.icon {
    fill: transparent;
    animation:
      dasharray 1s linear forwards,
      linear forwards 0.95s;
  }
  @keyframes dasharray {
    from {
      stroke-dasharray: 0 0 0 0;
    }
    to {
      stroke-dasharray: 68 68 0 0;
    }
  }
  @keyframes filled {
    to {
      fill: white;
    }
  }`;

const StyledButtonWrapper = styled.div.withConfig({
  componentId: 'StyledButtonWrapper',
  shouldForwardProp: (prop: string) => prop !== 'themeMode',
})<{ themeMode: string }>`
  max-width: 100%;

  .custom-button {
    background: transparent;
    border-radius: 0.5em;
    box-shadow:
      inset 0px -6px 18px -6px rgba(3, 15, 20, 0),
      inset 12px 0px 12px -6px rgba(3, 15, 20, 0),
      inset -12px 0px 12px -6px rgba(3, 15, 20, 0),
      ${({ themeMode }) =>
          themeMode === 'dark' ? '#bf0413' : '#44b6e3'} -1px -1px
        6px 0px;
    cursor: pointer;
    font-size: 18px;
    padding: 0.7em 1.7em;
    outline: none;
    transition: all 0.3s;
    user-select: none;
    max-width: 100%;
  }

  .custom-button:hover {
    box-shadow:
      inset 0px -6px 18px -6px rgba(3, 15, 20, 1),
      inset 0px 6px 18px -6px rgba(3, 15, 20, 1),
      inset 12px 0px 12px -6px rgba(3, 15, 20, 0),
      inset -12px 0px 12px -6px rgba(3, 15, 20, 0),
      -1px -1px 6px 0px
        ${({ themeMode }) => (themeMode === 'dark' ? '#bf0413' : '#44b6e3')};
  }

  .custom-button:active {
    box-shadow:
      inset 0px -12px 12px -6px rgba(3, 15, 20, 1),
      inset 0px 12px 12px -6px rgba(3, 15, 20, 1),
      inset 12px 0px 12px -6px rgba(3, 15, 20, 1),
      inset -12px 0px 12px -6px rgba(3, 15, 20, 1),
      -1px -1px 6px 0px
        ${({ themeMode }) => (themeMode === 'dark' ? '#bf0413' : '#44b6e3')};
  }

  .text {
    color: ${({ themeMode }) => (themeMode === 'dark' ? '#fff' : '#333')};
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s;
  }

  .custom-button:hover .text {
    transform: scale(0.95);
  }

  .custom-button:active .text {
    transform: scale(0.9);
  }

  .icon {
    width: 18px;
    height: 18px;
  }
`;
