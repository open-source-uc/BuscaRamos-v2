import { useEffect, useState } from 'react';

/**
 * Hook to detect user's preferred motion settings
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to manage focus for accessibility
 */
export function useFocusManagement() {
  const [lastFocusedElement, setLastFocusedElement] = useState<HTMLElement | null>(null);

  const saveFocus = () => {
    setLastFocusedElement(document.activeElement as HTMLElement);
  };

  const restoreFocus = () => {
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            lastFocusable.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            firstFocusable.focus();
            e.preventDefault();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  };

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
  };
}

/**
 * Hook to announce content to screen readers
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement(''); // Clear first to ensure re-announcement
    setTimeout(() => setAnnouncement(message), 10);
  };

  const AnnouncementRegion = () => (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );

  return {
    announce,
    AnnouncementRegion,
  };
}

/**
 * Utility to generate accessible IDs
 */
export function useAccessibleId(prefix: string = 'accessible'): string {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return id;
}

/**
 * Hook for keyboard navigation
 */
export function useKeyboardNavigation(
  items: any[],
  onSelect?: (item: any, index: number) => void
) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && onSelect) {
          onSelect(items[activeIndex], activeIndex);
        }
        break;
      case 'Escape':
        setActiveIndex(-1);
        break;
    }
  };

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
}

/**
 * Accessibility utilities for form validation
 */
export const a11yFormUtils = {
  /**
   * Generate ARIA attributes for form fields
   */
  getFieldProps: (fieldId: string, error?: string, description?: string) => {
    const props: Record<string, string> = {
      id: fieldId,
      'aria-invalid': error ? 'true' : 'false',
    };

    if (error) {
      props['aria-describedby'] = `${fieldId}-error`;
    }

    if (description) {
      props['aria-describedby'] = `${fieldId}-description`;
    }

    if (error && description) {
      props['aria-describedby'] = `${fieldId}-description ${fieldId}-error`;
    }

    return props;
  },

  /**
   * Generate ARIA attributes for error messages
   */
  getErrorProps: (fieldId: string) => ({
    id: `${fieldId}-error`,
    role: 'alert',
    'aria-live': 'polite' as const,
  }),

  /**
   * Generate ARIA attributes for field descriptions
   */
  getDescriptionProps: (fieldId: string) => ({
    id: `${fieldId}-description`,
  }),
};

/**
 * Color contrast utility (basic implementation)
 */
export function getContrastRatio(color1: string, color2: string): number {
  // This is a simplified implementation
  // In a real application, you'd want a more robust color parsing library
  
  const getLuminance = (color: string): number => {
    // Convert hex to RGB and calculate luminance
    // This is a basic implementation
    return 0.5; // Placeholder
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsContrastRequirement(
  ratio: number,
  level: 'AA' | 'AAA' = 'AA',
  textSize: 'normal' | 'large' = 'normal'
): boolean {
  if (level === 'AAA') {
    return textSize === 'large' ? ratio >= 4.5 : ratio >= 7;
  }
  return textSize === 'large' ? ratio >= 3 : ratio >= 4.5;
}