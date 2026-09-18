import imageManifest from "../generated/image-manifest.json";

export type PublicImageData = {
  width: number;
  height: number;
  srcset?: string;
};

const manifest = imageManifest as Record<string, PublicImageData>;

export const getPublicImageData = (src: string): PublicImageData | undefined => manifest[src];
