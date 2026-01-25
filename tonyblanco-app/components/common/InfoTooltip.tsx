'use client';

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  title: string;
  description: string;
  examples?: string[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export default function InfoTooltip({
  title,
  description,
  examples = [],
  position = 'top',
  className = '',
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-white',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-5 h-5 text-purple-400 hover:text-purple-300 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent rounded-full"
        aria-label="Más información"
      >
        <HelpCircle className="w-full h-full" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]}`}
            style={{ minWidth: '280px', maxWidth: '400px' }}
          >
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-8 border-transparent ${arrowClasses[position]}`}
            />

            {/* Tooltip content */}
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-2">
                {title}
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed mb-3">
                {description}
              </p>

              {examples.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-xs font-semibold text-gray-800 mb-2">
                    Ejemplos:
                  </p>
                  <ul className="space-y-1">
                    {examples.map((example, index) => (
                      <li
                        key={index}
                        className="text-xs text-gray-600 flex items-start gap-2"
                      >
                        <span className="text-purple-500 mt-0.5">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic">
                  💡 Tip: Esta información te ayuda a interpretar mejor los resultados
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
