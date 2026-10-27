import Image from 'next/image';

const palettes: Record<string, [string, string, string]> = {
  woven: ['#d18c55', '#0f5132', '#f2a900'],
  honey: ['#f2bd43', '#a94b2e', '#fff0bd'],
  fabric: ['#d26e5d', '#0f5132', '#f2c279'],
  clay: ['#c86d48', '#f3d49b', '#7c392d'],
  bamboo: ['#b4c17d', '#254d39', '#f2a900'],
  pickle: ['#a8b64a', '#d2643e', '#f4d797'],
  oil: ['#7d9a58', '#a65a3b', '#f3dcad'],
  book: ['#bc593d', '#174c37', '#e6b54d'],
  wood: ['#dfa34f', '#457957', '#c14e36'],
  shirt: ['#d5b17a', '#315b4a', '#b64e38'],
  jute: ['#c49a60', '#54734b', '#e6bc63'],
  mat: ['#d9ac68', '#356548', '#a94b37'],
};

export function ProductImage({
  variant,
  name,
  imageUrl,
  secondary = false,
  view = 0,
  className = '',
}: {
  variant: string;
  name: string;
  imageUrl?: string;
  secondary?: boolean;
  view?: number;
  className?: string;
}) {
  const [base, ink, accent] = palettes[variant] ?? palettes.woven;
  return (
    <div
      aria-label={`${name}, illustrated product preview`}
      className={`product-art product-art-view-${view} ${imageUrl ? 'has-product-image' : ''} ${className}`}
      role="img"
      style={
        {
          '--art-base': base,
          '--art-ink': secondary ? accent : ink,
          '--art-accent': secondary ? ink : accent,
        } as React.CSSProperties
      }
    >
      {imageUrl ? (
        <Image
          alt={name}
          className="object-cover"
          fill
          sizes="(max-width: 640px) 90vw, 600px"
          src={imageUrl}
          unoptimized
        />
      ) : (
        <span aria-hidden="true" className={`art-object art-${variant}`} />
      )}
      <span aria-hidden="true" className="art-sun" />
      <span aria-hidden="true" className="art-caption">
        হাটের পছন্দ
      </span>
    </div>
  );
}
