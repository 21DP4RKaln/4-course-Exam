'use client'

import { useRef } from 'react'
import { Image, Upload, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ProfileImageUploadProps } from './types'

export default function ProfileImageUpload({ currentImage, onChange, onDelete }: ProfileImageUploadProps) {
  const imageT = useTranslations('dashboard.profileImage')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0])
    }
  }
  
  return (
    <motion.div 
      className="flex flex-col items-center space-y-4 p-6 rounded-xl bg-blue-50/70 dark:bg-red-950/20"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-medium text-blue-700 dark:text-red-400 mb-2">
        {imageT('title')}
      </h3>
      <motion.div
        onClick={handleImageClick}
        className="relative w-36 h-36 rounded-full bg-white dark:bg-stone-950 border-2 border-blue-300 dark:border-red-500/30 flex items-center justify-center cursor-pointer overflow-hidden group hover:shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {currentImage ? (
          <img 
            src={currentImage}
            alt={imageT('altText')}
            className="w-full h-full object-cover"
          />
        ) : (
          <Image size={48} className="text-blue-500 dark:text-red-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/70 dark:from-red-600/70 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center">
            <Upload size={24} className="text-white mr-1" />
            <span className="text-white text-sm font-medium">{imageT('upload')}</span>
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
      </motion.div>      <motion.p 
        className="text-sm text-blue-600 dark:text-red-400 font-medium mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {imageT('changeText')}
      </motion.p>
      <motion.p
        className="text-xs text-blue-500/70 dark:text-red-300/70 text-center max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {imageT('helpText')}
      </motion.p>
        {currentImage && onDelete && (
        <div className="w-full flex justify-start">
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="px-2 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-lg flex hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Trash2 size={16} className="mr-2" />
            {imageT('deleteText') || 'Delete photo'}
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}
