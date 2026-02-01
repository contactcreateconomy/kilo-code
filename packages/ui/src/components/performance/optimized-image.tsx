"use client";

/**
 * Optimized Image Component
 *
 * Enhanced wrapper around next/image with automatic WebP/AVIF support,
 * lazy loading, blur placeholder, and priority loading for LCP images.
 */

import Image, { type ImageProps } from "next/image";
import { useState, useCallback, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  /** Aspect ratio for the image container (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string;
  /** Whether this is an LCP (Largest Contentful Paint) image */
  isLcp?: boolean;
  /** Custom blur data URL */
  blurDataUrl?: string;
  /** Whether to show a loading skeleton */
  showSkeleton?: boolean;
  /** Custom skeleton class */
  skeletonClassName?: string;
  /** Callback when image loads */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Fallback image URL */
  fallbackSrc?: string;
  /** Container className */
  containerClassName?: string;
  /** Whether to use object-cover (default) or object-contain */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  /** Image quality (1-100) */
  quality?: number;
}

// ============================================================================
// Default Blur Placeholder
// ============================================================================

/**
 * Generate a simple blur placeholder SVG
 */
function generateBlurPlaceholder(width: number, height: number): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
      <rect width="100%" height="100%" fill="#e5e7eb" filter="url(#b)"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * Default blur data URL for placeholder
 */
const DEFAULT_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZmlsdGVyIGlkPSJiIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPjxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjIwIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2U1ZTdlYiIgZmlsdGVyPSJ1cmwoI2IpIi8+PC9zdmc+";

// ============================================================================
// Component
// ============================================================================

/**
 * Optimized Image Component
 *
 * @example
 * ```tsx
 * // Basic usage
 * <OptimizedImage
 *   src="/hero.jpg"
 *   alt="Hero image"
 *   width={1200}
 *   height={600}
 *   isLcp
 * />
 *
 * // With aspect ratio container
 * <OptimizedImage
 *   src="/product.jpg"
 *   alt="Product"
 *   fill
 *   aspectRatio="4/3"
 *   showSkeleton
 * />
 *
 * // With fallback
 * <OptimizedImage
 *   src={product.image}
 *   alt={product.name}
 *   width={400}
 *   height={300}
 *   fallbackSrc="/placeholder.jpg"
 * />
 * ```
 */
export function OptimizedImage({
  src,
  alt,
  aspectRatio,
  isLcp = false,
  blurDataUrl,
  showSkeleton = true,
  skeletonClassName,
  onLoad,
  onError,
  fallbackSrc,
  containerClassName,
  objectFit = "cover",
  quality = 85,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
  loading,
  placeholder,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Handle image load
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  // Handle image error
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);

    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    }

    onError?.();
  }, [fallbackSrc, currentSrc, onError]);

  // Determine loading strategy
  const loadingStrategy = isLcp ? undefined : loading || "lazy";
  const shouldPrioritize = isLcp || priority;

  // Determine placeholder
  const placeholderType = placeholder || (showSkeleton ? "blur" : "empty");
  const blurUrl = blurDataUrl || DEFAULT_BLUR_DATA_URL;

  // Generate responsive sizes if not provided
  const responsiveSizes =
    sizes ||
    (fill
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      : undefined);

  // Container styles for aspect ratio
  const containerStyle: CSSProperties = aspectRatio
    ? { aspectRatio, position: "relative" }
    : {};

  // Image styles
  const imageStyle: CSSProperties = {
    objectFit,
  };

  // Render with container if aspect ratio is specified
  if (aspectRatio || fill) {
    return (
      <div
        className={cn(
          "relative overflow-hidden",
          aspectRatio && "w-full",
          containerClassName
        )}
        style={containerStyle}
      >
        {/* Loading skeleton */}
        {showSkeleton && isLoading && (
          <div
            className={cn(
              "absolute inset-0 animate-pulse bg-muted",
              skeletonClassName
            )}
          />
        )}

        {/* Image */}
        <Image
          src={currentSrc}
          alt={alt}
          fill={fill !== false}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          sizes={responsiveSizes}
          quality={quality}
          priority={shouldPrioritize}
          loading={loadingStrategy}
          placeholder={placeholderType}
          blurDataURL={placeholderType === "blur" ? blurUrl : undefined}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            hasError && "opacity-50",
            className
          )}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />

        {/* Error state */}
        {hasError && !fallbackSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">
              Failed to load image
            </span>
          </div>
        )}
      </div>
    );
  }

  // Render without container
  return (
    <div className={cn("relative inline-block", containerClassName)}>
      {showSkeleton && isLoading && (
        <div
          className={cn(
            "absolute inset-0 animate-pulse bg-muted rounded",
            skeletonClassName
          )}
        />
      )}
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={responsiveSizes}
        quality={quality}
        priority={shouldPrioritize}
        loading={loadingStrategy}
        placeholder={placeholderType}
        blurDataURL={placeholderType === "blur" ? blurUrl : undefined}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          hasError && "opacity-50",
          className
        )}
        style={imageStyle}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
}

// ============================================================================
// Responsive Image Component
// ============================================================================

export interface ResponsiveImageProps extends Omit<OptimizedImageProps, "sizes"> {
  /** Breakpoint sizes configuration */
  breakpoints?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    "2xl"?: string;
  };
}

/**
 * Responsive Image with predefined breakpoints
 *
 * @example
 * ```tsx
 * <ResponsiveImage
 *   src="/hero.jpg"
 *   alt="Hero"
 *   fill
 *   breakpoints={{
 *     sm: "100vw",
 *     md: "50vw",
 *     lg: "33vw",
 *   }}
 * />
 * ```
 */
export function ResponsiveImage({
  breakpoints = {},
  ...props
}: ResponsiveImageProps) {
  const {
    sm = "100vw",
    md = "100vw",
    lg = "50vw",
    xl = "33vw",
    "2xl": xxl = "25vw",
  } = breakpoints;

  const sizes = [
    `(max-width: 640px) ${sm}`,
    `(max-width: 768px) ${md}`,
    `(max-width: 1024px) ${lg}`,
    `(max-width: 1280px) ${xl}`,
    xxl,
  ].join(", ");

  return <OptimizedImage {...props} sizes={sizes} />;
}

// ============================================================================
// Avatar Image Component
// ============================================================================

export interface AvatarImageProps {
  src?: string | null;
  alt: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string;
  className?: string;
}

const avatarSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

/**
 * Optimized Avatar Image
 *
 * @example
 * ```tsx
 * <AvatarImage
 *   src={user.avatar}
 *   alt={user.name}
 *   size="md"
 *   fallback={user.name.charAt(0)}
 * />
 * ```
 */
export function AvatarImage({
  src,
  alt,
  size = "md",
  fallback,
  className,
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);
  const dimension = avatarSizes[size];

  if (!src || hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium",
          className
        )}
        style={{ width: dimension, height: dimension }}
      >
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={dimension}
      height={dimension}
      className={cn("rounded-full", className)}
      showSkeleton
      onError={() => setHasError(true)}
    />
  );
}

// ============================================================================
// Product Image Component
// ============================================================================

export interface ProductImageProps extends Omit<OptimizedImageProps, "aspectRatio"> {
  /** Product image aspect ratio */
  ratio?: "square" | "portrait" | "landscape" | "wide";
}

const productRatios = {
  square: "1/1",
  portrait: "3/4",
  landscape: "4/3",
  wide: "16/9",
};

/**
 * Optimized Product Image with common e-commerce ratios
 *
 * @example
 * ```tsx
 * <ProductImage
 *   src={product.image}
 *   alt={product.name}
 *   ratio="square"
 *   isLcp={isFirstProduct}
 * />
 * ```
 */
export function ProductImage({
  ratio = "square",
  ...props
}: ProductImageProps) {
  return (
    <OptimizedImage
      {...props}
      fill
      aspectRatio={productRatios[ratio]}
      showSkeleton
    />
  );
}

// ============================================================================
// Background Image Component
// ============================================================================

export interface BackgroundImageProps {
  src: string;
  alt: string;
  children?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  priority?: boolean;
}

/**
 * Background Image with overlay support
 *
 * @example
 * ```tsx
 * <BackgroundImage
 *   src="/hero-bg.jpg"
 *   alt="Hero background"
 *   className="min-h-[400px]"
 *   overlayClassName="bg-black/50"
 *   priority
 * >
 *   <h1 className="text-white">Welcome</h1>
 * </BackgroundImage>
 * ```
 */
export function BackgroundImage({
  src,
  alt,
  children,
  className,
  overlayClassName,
  priority = false,
}: BackgroundImageProps) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        showSkeleton={false}
      />
      {overlayClassName && (
        <div className={cn("absolute inset-0", overlayClassName)} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export { generateBlurPlaceholder, DEFAULT_BLUR_DATA_URL };
