'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import styled from 'styled-components'
import React from 'react'
import { useTranslations } from 'next-intl'
import AnimatedButton from '../ui/animated-button'

export default function PrivacyPolicyPage() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1]
  const t = useTranslations('privacyPolicy')

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">      <div className="mb-8">
        <Link href={`/${locale}`}>
          <AnimatedButton 
            title={t('back')}
            direction="left"
          />
        </Link>
      </div>

      <div className="bg-white dark:bg-stone-950 shadow-lg rounded-lg p-8 transition-colors duration-200">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {t('lastUpdated')}: May 1, 2025
          </p>

          <h2 className="text-2xl font-semibold text-stone-950 dark:text-gray-200 mt-8 mb-4">{t('introduction.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t('introduction.content')}
          </p>

          <h2 className="text-2xl font-semibold text-stone-950 dark:text-gray-200 mt-8 mb-4">{t('dataCollection.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {t('dataCollection.content')}
          </p>
          <ul className="list-disc list-inside mb-6 text-gray-700 dark:text-gray-300">
            <li className="mb-2"><strong>{t('dataCollection.identityData')}:</strong> {t('dataCollection.identityDataDesc')}</li>
            <li className="mb-2"><strong>{t('dataCollection.contactData')}:</strong> {t('dataCollection.contactDataDesc')}</li>
            <li className="mb-2"><strong>{t('dataCollection.technicalData')}:</strong> {t('dataCollection.technicalDataDesc')}</li>
          </ul>

          <h2 className="text-2xl font-semibold text-stone-950 dark:text-gray-200 mt-8 mb-4">{t('dataUsage.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t('dataUsage.content')}
          </p>

          <h2 className="text-2xl font-semibold text-stone-950 dark:text-gray-200 mt-8 mb-4">{t('dataSecurity.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t('dataSecurity.content')}
          </p>

          <h2 className="text-2xl font-semibold text-stone-950 dark:text-gray-200 mt-8 mb-4">{t('dataRetention.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t('dataRetention.content')}
          </p>

          <h2 className="text-2xl font-semibold text-stone-950 dark:text-gray-200 mt-8 mb-4">{t('legalRights.title')}</h2>
          <ul className="list-disc list-inside mb-6 text-gray-700 dark:text-gray-300">
            <li>{t('legalRights.content')}</li>
          </ul>

          <h2 className="text-2xl font-semibold text-stone-950 dark:text-gray-200 mt-8 mb-4">{t('contact.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            {t('contact.email')}: privacy@ivapro.com<br />
            {t('contact.phone')}: +371 12345678<br />
            {t('contact.address')}: Riga, Latvia
          </p>

          <h2 className="text-2xl font-semibold text-stone-950 dark:text-gray-200 mt-8 mb-4">{t('changes.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t('changes.content')}
          </p>
        </div>
      </div>
    </div>
  )
}

const StyledWrapper = styled.div`
  .button {
    position: relative;
    text-decoration: none;
    color: #fff;
    background: linear-gradient(45deg, #0ccde3, #ebddde, #ed0216);
    background-size: 300% 300%;
    animation: gradientAnimation 15s ease infinite;
    padding: 14px 25px;
    border-radius: 10px;
    font-size: 1.25em;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: all 0.3s ease;
  }

  @keyframes gradientAnimation {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .button span {
    position: relative;
    z-index: 1;
  }

  .button:active {
    transform: scale(0.98);
    box-shadow: 0 0 1px 2px rgba(255, 255, 255, 0.3),
      0 10px 3px -3px rgba(0, 0, 0, 0.2);
  }

  .button::before {
    content: "";
    position: absolute;
    inset: 1px;
    background: #000000;
    border-radius: 9px;
    transition: all 0.5s ease;
    z-index: 0;
  }

  html.dark .button::before {
    background: #000000;
  }

  .button:hover::before {
    opacity: 0.8;
    transform: scale(0.95);
  }

  .button:hover {
    transform: scale(1.02);
    box-shadow: 0 5px 15px -5px rgba(0, 0, 0, 0.3);
  }

  .button:active {
    transform: scale(0.98);
  }

  .button::after {
    content: "";
    position: absolute;
    inset: 0px;
    background: linear-gradient(45deg, #0ccde3, #ebddde, #ed0216);
    border-radius: 9px;
    transition: all 0.5s ease;
    opacity: 0;
    filter: blur(25px);
    z-index: 0;
  }

  .button:hover::after {
    opacity: 0.6;
    animation: glowingEffect 4s ease infinite;
  }

  @keyframes glowingEffect {
    0% {
      box-shadow: 0 0 5px #0ccde3,
                  0 0 10px #0ccde3,
                  0 0 20px #ed0216;
    }
    50% {
      box-shadow: 0 0 10px #0ccde3,
                  0 0 20px #ed0216,
                  0 0 30px #0ccde3;
    }
    100% {
      box-shadow: 0 0 5px #0ccde3,
                  0 0 10px #0ccde3,
                  0 0 20px #ed0216;
    }
  }

  .button svg {
    z-index: 1;
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.2));
  }

  html.dark .button svg {
    stroke: #ffffff;
  }

  html:not(.dark) .button svg {
    stroke: #000000;
  }

  .button:hover svg {
    transform: translateX(-2px);
  }
`;