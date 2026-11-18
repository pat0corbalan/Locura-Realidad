/**
 * Optimiza una imagen de Cloudinary para web con buena calidad y peso optimizado.
 *
 * @param url URL original de Cloudinary
 * @param options Opciones de optimización
 * @param options.width Ancho máximo (default 800)
 * @param options.quality Calidad deseada (default 'auto:good')
 * @param options.crop Tipo de recorte (default 'scale')
 * @param options.format Formato de imagen (default 'auto')
 * @returns URL optimizada
 */
export function optimizeCloudinaryImage(
  url: string,
  options?: {
    width?: number;
    quality?: string;
    crop?: string;
    format?: string;
  }
): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;

  const {
    width = 800,
    quality = "auto:good", // calidad alta con buena compresión
    crop = "scale",
    format = "auto",
  } = options || {};

  const [prefix, suffix] = url.split("/upload/");

  if (!suffix) return url;

  const transformations = [
    `q_${quality}`,
    `f_${format}`,
    `w_${width}`,
    `c_${crop}`,
  ].join(",");

  return `${prefix}/upload/${transformations}/${suffix}`;
}
