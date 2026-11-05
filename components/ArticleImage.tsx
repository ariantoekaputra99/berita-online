import Image from "next/image";

type Props = {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Renders a cover image that fills its (position: relative) parent.
 * Unsplash images use next/image; writer uploads and images from news feeds
 * come from many hosts, so they use a plain <img> (no optimizer allow-list needed).
 */
export function ArticleImage({ src, alt, sizes, priority, className }: Props) {
  if (!src) return <span className="image-placeholder" aria-hidden="true">N</span>;

  if (src.startsWith("https://images.unsplash.com/")) {
    return <Image alt={alt} className={className} fill priority={priority} sizes={sizes} src={src} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={alt}
      className={className}
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
      src={src}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
    />
  );
}
