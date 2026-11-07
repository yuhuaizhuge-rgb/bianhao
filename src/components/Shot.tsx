import type { ReactNode } from "react";

type ShotProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: ReactNode;
  scroll?: boolean;
  variant?: "narrow" | "dialog";
  loading?: "eager" | "lazy";
};

export function Shot({
  src,
  alt,
  width,
  height,
  caption,
  scroll = false,
  variant,
  loading = "lazy",
}: ShotProps) {
  const figureClass = ["shot", variant ? `is-${variant}` : ""].filter(Boolean).join(" ");
  return (
    <figure className={figureClass}>
      <div
        className={scroll ? "shot-view is-scroll" : "shot-view"}
        tabIndex={scroll ? 0 : undefined}
        aria-label={scroll ? `${alt}，可在画面内滚动` : undefined}
      >
        <img src={src} alt={alt} width={width} height={height} loading={loading} decoding="async" />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}
