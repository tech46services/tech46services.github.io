import { access, mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const imageRoot = path.join(projectRoot, "public", "assets", "img");
const responsiveWidths = [480, 720];

const pathExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const isCurrent = async (sourcePath, outputPath) => {
  if (!(await pathExists(outputPath))) return false;

  const [sourceStats, outputStats] = await Promise.all([stat(sourcePath), stat(outputPath)]);
  return outputStats.mtimeMs >= sourceStats.mtimeMs;
};

const getWebpSources = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await getWebpSources(entryPath));
    } else if (entry.name.endsWith(".webp") && !/-\d+\.webp$/.test(entry.name)) {
      files.push(entryPath);
    }
  }

  return files;
};

const generateWebpVariants = async (sourcePath) => {
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width) return;

  for (const width of responsiveWidths) {
    if (width >= metadata.width) continue;

    const extension = path.extname(sourcePath);
    const outputPath = `${sourcePath.slice(0, -extension.length)}-${width}.webp`;
    if (await isCurrent(sourcePath, outputPath)) continue;

    await sharp(sourcePath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6, smartSubsample: true })
      .toFile(outputPath);
  }
};

const generatePng = async (sourceName, outputName, width) => {
  const sourcePath = path.join(imageRoot, sourceName);
  const outputPath = path.join(imageRoot, outputName);
  if (await isCurrent(sourcePath, outputPath)) return;

  await sharp(sourcePath)
    .resize({ width, withoutEnlargement: true })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(outputPath);
};

const responsiveDirectories = [
  path.join(imageRoot, "photos-depannage"),
  path.join(imageRoot, "conseils"),
  path.join(imageRoot, "actu"),
];

const heroSources = [
  path.join(imageRoot, "image_acceuil.webp"),
  path.join(imageRoot, "image_depannage.webp"),
  path.join(imageRoot, "image_espacepro.webp"),
];

await mkdir(imageRoot, { recursive: true });

const responsiveSources = [
  ...await Promise.all(responsiveDirectories.map(getWebpSources)).then((groups) => groups.flat()),
  ...heroSources,
];

await Promise.all(responsiveSources.map(generateWebpVariants));

await Promise.all([
  generatePng("logo-no-text.png", "logo-no-text-96.png", 96),
  generatePng("logo-no-text.png", "logo-no-text-192.png", 192),
  generatePng("text-logo.png", "text-logo-512.png", 512),
  generatePng("text-logo.png", "text-logo-1024.png", 1024),
  generatePng("logo-tech46.png", "logo-tech46-128.png", 128),
  generatePng("logo-tech46.png", "logo-tech46-256.png", 256),
]);

const manifestEntries = await Promise.all(responsiveSources.map(async (sourcePath) => {
  const metadata = await sharp(sourcePath).metadata();
  if (!metadata.width || !metadata.height) return undefined;

  const publicSrc = `/${path.relative(path.join(projectRoot, "public"), sourcePath).replaceAll(path.sep, "/")}`;
  const extension = path.posix.extname(publicSrc);
  const variants = [];

  for (const width of responsiveWidths) {
    if (width >= metadata.width) continue;

    const variantSrc = `${publicSrc.slice(0, -extension.length)}-${width}.webp`;
    const variantPath = path.join(projectRoot, "public", variantSrc.replace(/^\//, ""));
    if (await pathExists(variantPath)) variants.push(`${variantSrc} ${width}w`);
  }

  return [publicSrc, {
    width: metadata.width,
    height: metadata.height,
    srcset: [...variants, `${publicSrc} ${metadata.width}w`].join(", "),
  }];
}));

const manifest = Object.fromEntries(manifestEntries.filter(Boolean));
const generatedDirectory = path.join(projectRoot, "src", "generated");
await mkdir(generatedDirectory, { recursive: true });
await writeFile(
  path.join(generatedDirectory, "image-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
