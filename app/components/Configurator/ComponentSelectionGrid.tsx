'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import ComponentCard from './ComponentCard';
import ComponentModal from './ComponentModal';
import { useTheme } from '@/app/contexts/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './customScrollbar.css';

interface ComponentSelectionGridProps {
  components: any[];
  activeCategory: string;
  loading: boolean;
  selectedComponents: Record<string, any>;
  onSelectComponent: (component: any) => void;
}

const ComponentSelectionGrid: React.FC<ComponentSelectionGridProps> = ({
  components,
  activeCategory,
  loading,
  selectedComponents,
  onSelectComponent,
}) => {
  const t = useTranslations('configurator');
  const { theme } = useTheme();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const componentsPerPage = 7;

  // Modal state for mobile
  const [selectedModalComponent, setSelectedModalComponent] =
    useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reset page when category or components change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, components?.length]);

  const handleViewDetails = (component: any) => {
    setSelectedModalComponent(component);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedModalComponent(null);
  };
  // Animation variants
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const paginationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: 0.3,
        ease: 'easeOut',
      },
    },
  };

  if (loading) {
    return (
      <motion.div
        className="flex items-center justify-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`rounded-full h-10 w-10 border-t-2 border-b-2 ${
            theme === 'dark' ? 'border-brand-red-500' : 'border-brand-blue-500'
          }`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </motion.div>
    );
  }
  // Ensure components is an array
  const componentArray = Array.isArray(components) ? components : [];

  if (componentArray.length === 0) {
    return (
      <motion.div
        className={`rounded-lg p-8 text-center border border-dashed ${
          theme === 'dark'
            ? 'bg-stone-900/50 border-neutral-800 text-neutral-400'
            : 'bg-neutral-100/50 border-neutral-300 text-neutral-500'
        }`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {t('noComponentsFound')}
        </motion.p>
      </motion.div>
    );
  }

  // Pagination calculations
  const totalPages = Math.ceil(componentArray.length / componentsPerPage);
  const indexOfLastComponent = currentPage * componentsPerPage;
  const indexOfFirstComponent = indexOfLastComponent - componentsPerPage;
  const currentComponents = componentArray.slice(
    indexOfFirstComponent,
    indexOfLastComponent
  );
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  return (
    <motion.div
      className="w-full px-2 sm:px-4 pb-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`space-y-6 overflow-y-auto scrollbar-hide w-full pr-1 ${
          theme === 'dark' ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'
        }`}
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        key={`${activeCategory}-${currentPage}`}
      >
        <AnimatePresence mode="popLayout">
          {currentComponents.map((component, index) => {
            // Check if component is selected - handle both single components and arrays
            const selectedInCategory = selectedComponents[activeCategory];
            let isSelected = false;

            if (selectedInCategory) {
              if (Array.isArray(selectedInCategory)) {
                // For arrays (like services), check if component is in the array
                isSelected = selectedInCategory.some(
                  c => c.id === component.id
                );
              } else {
                // For single components, check ID directly
                isSelected = selectedInCategory.id === component.id;
              }
            }

            return (
              <motion.div
                key={component.id}
                className="w-full min-w-0"
                variants={itemVariants}
                layout
                layoutId={`component-${component.id}`}
                whileHover={{ scale: 1.005 }}
                transition={{
                  layout: { duration: 0.3, ease: 'easeOut' },
                  scale: { duration: 0.2 },
                }}
              >
                <ComponentCard
                  component={component}
                  isSelected={isSelected}
                  onSelect={onSelectComponent}
                  onViewDetails={handleViewDetails}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
      {/* Pagination controls */}
      {totalPages > 1 && (
        <motion.div
          className="flex justify-center items-center mt-6 gap-2"
          role="navigation"
          aria-label="Component pagination"
          variants={paginationVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-full ${
              theme === 'dark'
                ? 'text-neutral-400 hover:bg-stone-800 disabled:text-neutral-700'
                : 'text-neutral-600 hover:bg-neutral-100 disabled:text-neutral-300'
            } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              theme === 'dark'
                ? 'focus:ring-brand-red-500'
                : 'focus:ring-brand-blue-500'
            }`}
            aria-label="Previous page"
            whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
            whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronLeft size={20} />
          </motion.button>

          <motion.span
            className={`text-sm ${
              theme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'
            }`}
            aria-live="polite"
            key={currentPage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {t('pagination.pageOf', {
              currentPage: currentPage,
              totalPages: totalPages,
              defaultMessage: `Page ${currentPage} of ${totalPages}`,
            })}
          </motion.span>

          <motion.button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full ${
              theme === 'dark'
                ? 'text-neutral-400 hover:bg-stone-800 disabled:text-neutral-700'
                : 'text-neutral-600 hover:bg-neutral-100 disabled:text-neutral-300'
            } disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              theme === 'dark'
                ? 'focus:ring-brand-red-500'
                : 'focus:ring-brand-blue-500'
            }`}
            aria-label="Next page"
            whileHover={{ scale: currentPage === totalPages ? 1 : 1.1 }}
            whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronRight size={20} />
          </motion.button>
        </motion.div>
      )}

      {/* Mobile Component Details Modal */}
      <AnimatePresence mode="wait">
        {isModalOpen && (
          <ComponentModal
            component={selectedModalComponent}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            isSelected={
              selectedComponents[activeCategory]?.id ===
              selectedModalComponent?.id
            }
            onSelect={onSelectComponent}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ComponentSelectionGrid;
