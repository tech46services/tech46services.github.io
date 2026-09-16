export type RealisationBlock =
  | { type: "heading"; content: string }
  | { type: "text"; content: string }
  | { type: "step"; content: string; images: Array<{ alt: string; src: string }> };

const headingPattern = /^##\s+(.+)$/;
const imagePattern = /^!\[([^\]]*)\]\(([^)]+)\)$/;

/**
 * Les contenus de réalisations utilisent des paragraphes suivis de leurs
 * photos. Cette fonction conserve les données source, mais prépare un rendu
 * chronologique « photos puis texte » pour chaque étape.
 */
export const getRealisationBlocks = (markdown: string): RealisationBlock[] => {
  const lines = markdown.split(/\r?\n/);
  const blocks: RealisationBlock[] = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const heading = line.match(headingPattern);
    if (heading) {
      blocks.push({ type: "heading", content: heading[1] });
      index += 1;
      continue;
    }

    const image = line.match(imagePattern);
    if (image) {
      const images: Array<{ alt: string; src: string }> = [];

      while (index < lines.length) {
        const current = lines[index].trim();
        const matchedImage = current.match(imagePattern);

        if (!current) {
          index += 1;
          continue;
        }

        if (!matchedImage) break;
        images.push({ alt: matchedImage[1], src: matchedImage[2] });
        index += 1;
      }

      blocks.push({ type: "step", content: "", images });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (!current) {
        index += 1;
        if (paragraph.length) break;
        continue;
      }
      if (headingPattern.test(current) || imagePattern.test(current)) break;
      paragraph.push(current);
      index += 1;
    }

    const content = paragraph.join(" ");
    const images: Array<{ alt: string; src: string }> = [];
    let imageIndex = index;

    while (imageIndex < lines.length) {
      const current = lines[imageIndex].trim();
      if (!current) {
        imageIndex += 1;
        continue;
      }
      const matchedImage = current.match(imagePattern);
      if (!matchedImage) break;
      images.push({ alt: matchedImage[1], src: matchedImage[2] });
      imageIndex += 1;
    }

    if (images.length) {
      blocks.push({ type: "step", content, images });
      index = imageIndex;
    } else if (content) {
      blocks.push({ type: "text", content });
    }
  }

  return blocks;
};
