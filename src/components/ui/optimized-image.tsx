import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/usePerformance';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  lazy?: boolean;
  className?: string;
  containerClassName?: string;
  loadingClassName?: string;
  errorClassName?: string;
  showPlaceholder?: boolean;
  placeholderColor?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.png',
  lazy = true,
  className,
  containerClassName,
  loadingClassName,
  errorClassName,
  showPlaceholder = true,
  placeholderColor = 'bg-muted',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  // Don't render image until it's visible (if lazy loading is enabled)
  const shouldRender = !lazy || hasIntersected;

  return (
    <div
      ref={ref as any}
      className={cn(
        'relative overflow-hidden',
        containerClassName
      )}
    >
      {/* Placeholder while loading */}
      {showPlaceholder && isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center',
            placeholderColor,
            loadingClassName
          )}
        >
          <div className="animate-pulse">
            <div className="h-8 w-8 rounded-full bg-current opacity-20" />
          </div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground',
            errorClassName
          )}
        >
          <span className="text-sm">Error al cargar imagen</span>
        </div>
      )}

      {/* Main image */}
      {shouldRender && (
        <Image
          src={currentSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoading && 'opacity-0',
            !isLoading && 'opacity-100',
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}

// Specialized component for avatars
export function Avatar({
  src,
  alt,
  size = 40,
  className,
  fallback,
  ...props
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallback?: React.ReactNode;
} & Omit<OptimizedImageProps, 'width' | 'height' | 'alt'>) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium',
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      {...props}
    />
  );
}