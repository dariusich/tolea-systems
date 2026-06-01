export const TOLEA_LOGO_SRC = "/assets/brand/tolea-systems-logo-cropped.png";

export default function BrandLogo({ className = "", compact = false, imageClassName = "" }) {
  return (
    <span className={`inline-flex items-center ${compact ? "gap-2" : "gap-3"} ${className}`}>
      <img
        src={TOLEA_LOGO_SRC}
        alt="Tolea Systems"
        className={`${compact ? "h-8" : "h-11"} w-auto object-contain ${imageClassName}`}
      />
    </span>
  );
}
