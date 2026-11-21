'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  yOffset?: number;
  variant?: 'fade-up' | 'scale-up' | 'blur-in';
}

/**
 * AliPos va Apple uslubidagi yengil, chaqqon va 120fps silliq Scroll Animation.
 * Sahifa tez aylantirilganda ham hech qanday qotish va kechikishsiz (lag-free)
 * elementlar mayin va o'z vaqtida ochiladi.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  className = '',
  yOffset = 18,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '80px 0px -30px 0px' }}
      transition={{
        duration: 0.38,
        ease: [0.16, 1, 0.3, 1], // Apple/AliPos standartidagi chaqqon va mayin sekinlashuv
        delay: Math.min(delay, 0.15),
      }}
      style={{ willChange: 'opacity, transform' }}
      className={`w-full max-w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
