/**
 * Heatmap Colors for BioEmotional Experiential Workspace
 * PROMPT #6: Mapa de Calor Emocional
 * 
 * Color palette for different emotional states mapped to body regions.
 * Colors are designed to be:
 * - Intuitive (warm colors for pain/tension, cool for flow)
 * - Accessible (WCAG AA contrast)
 * - Non-judgmental (no "good" vs "bad" implied)
 */

import type { EmotionType } from './types';

/**
 * Color palette for each emotion type with three intensity levels
 */
export const emotionColors: Record<EmotionType, { light: string; medium: string; dark: string }> = {
  neutral: {
    light: '#e5e7eb',
    medium: '#9ca3af',
    dark: '#6b7280',
  },
  tension: {
    light: '#fef3c7',
    medium: '#fbbf24',
    dark: '#f59e0b',
  },
  pain: {
    light: '#fee2e2',
    medium: '#f87171',
    dark: '#ef4444',
  },
  blocked: {
    light: '#e9d5ff',
    medium: '#c084fc',
    dark: '#9333ea',
  },
  flow: {
    light: '#d1fae5',
    medium: '#6ee7b7',
    dark: '#10b981',
  },
  warmth: {
    light: '#fed7aa',
    medium: '#fb923c',
    dark: '#f97316',
  },
};

/**
 * Emoji icons for each emotion type (for UI display)
 */
export const emotionIcons: Record<EmotionType, string> = {
  neutral: '😐',
  tension: '😰',
  pain: '😣',
  blocked: '🚫',
  flow: '✨',
  warmth: '🔥',
};

/**
 * Spanish labels for each emotion type
 */
export const emotionLabels: Record<EmotionType, string> = {
  neutral: 'Neutral',
  tension: 'Tensión',
  pain: 'Dolor',
  blocked: 'Bloqueo',
  flow: 'Flujo',
  warmth: 'Calidez',
};

/**
 * Get color based on emotion type and intensity level
 * @param emotionType - The type of emotion
 * @param intensity - Intensity value from 0 to 100
 * @returns Hex color string
 */
export function getColorForIntensity(
  emotionType: EmotionType,
  intensity: number
): string {
  const colors = emotionColors[emotionType];
  
  if (intensity < 33) {
    return colors.light;
  } else if (intensity < 66) {
    return colors.medium;
  } else {
    return colors.dark;
  }
}

/**
 * Get color with adjustable opacity for overlay rendering
 * @param emotionType - The type of emotion
 * @param intensity - Intensity value from 0 to 100
 * @param opacity - Opacity value from 0 to 1
 * @returns RGBA color string
 */
export function getColorWithOpacity(
  emotionType: EmotionType,
  intensity: number,
  opacity: number = 0.6
): string {
  const color = getColorForIntensity(emotionType, intensity);
  
  // Convert hex to rgba
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Scale opacity by intensity for more natural appearance
  const scaledOpacity = opacity * (intensity / 100);
  
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0.1, scaledOpacity)})`;
}

/**
 * Get a gradient for smooth intensity transitions
 * @param emotionType - The type of emotion
 * @returns CSS gradient string
 */
export function getGradientForEmotion(emotionType: EmotionType): string {
  const colors = emotionColors[emotionType];
  return `linear-gradient(135deg, ${colors.light}, ${colors.medium}, ${colors.dark})`;
}

/**
 * Get hex color for 3D material based on emotion and intensity
 * @param emotionType - The type of emotion
 * @param intensity - Intensity value from 0 to 100
 * @returns Hex color string suitable for Three.js materials
 */
export function getColorForEmotion(
  emotionType: EmotionType,
  intensity: number
): string {
  return getColorForIntensity(emotionType, intensity);
}
