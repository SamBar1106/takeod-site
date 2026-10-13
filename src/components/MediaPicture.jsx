import { MEDIA } from "../config.js";

const DEFAULT_SIZES = "(min-width: 1100px) 30vw, (min-width: 768px) 46vw, 92vw";

export function mediaUrl(file) {
  return `${MEDIA}${file}`;
}

export function MediaPicture({ image, sizes = DEFAULT_SIZES, loading = "lazy", fetchPriority, className, ref }) {
  if (!image) return null;
  if (image.url) {
    return (
      <img
        ref={ref}
        className={className}
        src={image.url}
        alt={image.alt || ""}
        width={image.width || 1280}
        height={image.height || 720}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    );
  }
  if (image.set) {
    const id = image.set;
    const src = (ext, width) => mediaUrl(`${id}-${width}.${ext}`);
    return (
      <picture>
        <source
          type="image/avif"
          srcSet={`${src("avif", 480)} 480w, ${src("avif", 800)} 800w, ${src("avif", 1280)} 1280w`}
          sizes={sizes}
        />
        <source
          type="image/webp"
          srcSet={`${src("webp", 480)} 480w, ${src("webp", 800)} 800w, ${src("webp", 1280)} 1280w`}
          sizes={sizes}
        />
        <img
          ref={ref}
          className={className}
          src={src("webp", 800)}
          alt={image.alt}
          width="1280"
          height="720"
          loading={loading}
          decoding="async"
          fetchPriority={fetchPriority}
        />
      </picture>
    );
  }
  return (
    <img
      ref={ref}
      className={className}
      src={mediaUrl(image.file)}
      alt={image.alt}
      width={image.width || 1280}
      height={image.height || 720}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
    />
  );
}
