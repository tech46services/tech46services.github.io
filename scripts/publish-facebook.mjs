import fs from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const SITE_URL = "https://tech46services.fr";
const GRAPH_API_VERSION = "v26.0";
const RECENT_POST_LIMIT = "50";

const pageId = process.env.FACEBOOK_PAGE_ID;
const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const dryRun = process.env.FACEBOOK_DRY_RUN === "true";

function parseFrontmatter(source) {
  source = source.replace(/^\uFEFF/, "");

  const match = source.match(
    /^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/
  );

  if (!match) {
    throw new Error("Frontmatter Astro introuvable.");
  }

  const data = parseYaml(match[1]);

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Le frontmatter doit être un objet YAML.");
  }

  return data;
}

function getContentInfo(filePath) {
  const normalized = filePath.replaceAll("\\", "/");

  const match = normalized.match(
    /^src\/content\/(realisations|conseils|actualites)\/(.+)\.md$/
  );

  if (!match) {
    return null;
  }

  const [, type, slug] = match;
  const encodedSlug = encodePathSegments(slug);

  return {
    type,
    slug,
    url: `${SITE_URL}/${type}/${encodedSlug}.html`,
  };
}

function encodePathSegments(value) {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function buildPublicImageUrl(imagePath) {
  if (imagePath === undefined || imagePath === null) {
    return null;
  }

  if (typeof imagePath !== "string" || !imagePath.startsWith("/")) {
    throw new Error(
      "Le champ image doit être un chemin public absolu commençant par /."
    );
  }

  return `${SITE_URL}${encodePathSegments(imagePath.replaceAll("\\", "/"))}`;
}

function buildFacebookMessage(type, title, description, url) {
  switch (type) {
    case "realisations":
      return [
        "🔧 Nouvelle réalisation Tech 46 Services",
        "",
        title,
        "",
        description,
        "",
        `👉 Découvrir l'intervention : ${url}`,
      ].join("\n");

    case "conseils":
      return [
        "💡 Nouveau conseil informatique",
        "",
        title,
        "",
        description,
        "",
        `👉 Lire le conseil : ${url}`,
      ].join("\n");

    case "actualites":
      return [
        "📢 Actualité Tech 46 Services",
        "",
        title,
        "",
        description,
        "",
        `👉 En savoir plus : ${url}`,
      ].join("\n");

    default:
      throw new Error(`Type de contenu inconnu : ${type}`);
  }
}

function redactSecret(value) {
  const text = String(value);
  return accessToken ? text.replaceAll(accessToken, "[SECRET MASQUÉ]") : text;
}

function createFacebookError(context, response, result) {
  const error = result?.error;
  const details = [`HTTP ${response.status}`];

  for (const [label, value] of [
    ["code", error?.code],
    ["type", error?.type],
    ["message", error?.message],
    ["fbtrace_id", error?.fbtrace_id],
  ]) {
    if (value !== undefined && value !== null && value !== "") {
      details.push(`${label}=${redactSecret(value)}`);
    }
  }

  return new Error(`Erreur Facebook (${context}) : ${details.join(" ; ")}`);
}

async function readFacebookResponse(response, context) {
  const responseText = await response.text();
  let result;

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(
      `Erreur Facebook (${context}) : HTTP ${response.status} ; réponse JSON invalide.`
    );
  }

  if (!response.ok || result.error) {
    throw createFacebookError(context, response, result);
  }

  return result;
}

async function fetchFacebook(url, options, context) {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error(`Impossible de contacter Facebook (${context}).`);
  }
}

function getFacebookHeaders() {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function messageContainsExactUrl(message, url) {
  if (typeof message !== "string") {
    return false;
  }

  const urls = message.match(/https?:\/\/[^\s]+/g) ?? [];
  return urls.includes(url);
}

async function isAlreadyPublished(url) {
  const endpoint = new URL(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(pageId)}/feed`
  );
  endpoint.searchParams.set("fields", "message,link,created_time");
  endpoint.searchParams.set("limit", RECENT_POST_LIMIT);

  const response = await fetchFacebook(
    endpoint,
    { headers: getFacebookHeaders() },
    "vérification des publications récentes"
  );
  const result = await readFacebookResponse(
    response,
    "vérification des publications récentes"
  );

  if (!Array.isArray(result.data)) {
    throw new Error(
      "Erreur Facebook (vérification des publications récentes) : réponse sans liste de publications."
    );
  }

  return result.data.some(
    (post) => post?.link === url || messageContainsExactUrl(post?.message, url)
  );
}

async function publishFacebookFeedPost({ message, url }) {
  if (!pageId || !accessToken) {
    throw new Error(
      "FACEBOOK_PAGE_ID ou FACEBOOK_PAGE_ACCESS_TOKEN manquant."
    );
  }

  const body = new URLSearchParams({
    message,
    link: url,
    published: "true",
  });

  const response = await fetchFacebook(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(pageId)}/feed`,
    {
      method: "POST",
      headers: getFacebookHeaders(),
      body,
    },
    "publication"
  );
  const result = await readFacebookResponse(response, "publication");

  return result.id;
}

async function publishFacebookPhoto({ caption, imageUrl }) {
  if (!pageId || !accessToken) {
    throw new Error(
      "FACEBOOK_PAGE_ID ou FACEBOOK_PAGE_ACCESS_TOKEN manquant."
    );
  }

  const body = new URLSearchParams({
    url: imageUrl,
    caption,
    published: "true",
  });

  const response = await fetchFacebook(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${encodeURIComponent(pageId)}/photos`,
    {
      method: "POST",
      headers: getFacebookHeaders(),
      body,
    },
    "publication photo"
  );
  const result = await readFacebookResponse(response, "publication photo");

  return result.id;
}

async function processFile(filePath) {
  const info = getContentInfo(filePath);

  if (!info) {
    console.log(`Ignoré : ${filePath}`);
    return;
  }

  const source = await fs.readFile(path.resolve(filePath), "utf8");
  const frontmatter = parseFrontmatter(source);

  if (frontmatter.draft === true) {
    console.log(`Ignoré (draft) : ${filePath}`);
    return;
  }

  if (frontmatter.socialPublish !== true) {
    console.log(`Ignoré (socialPublish != true) : ${filePath}`);
    return;
  }

  if (!frontmatter.title || !frontmatter.description) {
    throw new Error(
      `title ou description manquant dans ${filePath}`
    );
  }

  const message = buildFacebookMessage(
    info.type,
    frontmatter.title,
    frontmatter.description,
    info.url
  );
  const imageUrl = buildPublicImageUrl(frontmatter.image);
  const publicationMode = imageUrl ? "PHOTO" : "FEED";

  if (dryRun) {
    console.log("\n--- APERÇU FACEBOOK ---");
    console.log(`Fichier : ${filePath}`);
    console.log(`Type de contenu : ${info.type}`);
    console.log(`Titre : ${frontmatter.title}`);
    console.log(`URL de l'article : ${info.url}`);
    console.log(`URL de l'image : ${imageUrl ?? "(aucune)"}`);
    console.log(`Mode prévu : ${publicationMode}`);
    console.log("");
    console.log(message);
    console.log("------------------------\n");
    return;
  }

  if (!pageId || !accessToken) {
    throw new Error(
      "FACEBOOK_PAGE_ID ou FACEBOOK_PAGE_ACCESS_TOKEN manquant."
    );
  }

  if (await isAlreadyPublished(info.url)) {
    console.log(`Déjà publié sur Facebook : ${info.url}`);
    return;
  }

  const postId = imageUrl
    ? await publishFacebookPhoto({ caption: message, imageUrl })
    : await publishFacebookFeedPost({ message, url: info.url });

  console.log(`Publié sur Facebook : ${filePath}`);
  console.log(`Post ID : ${postId}`);
}

const files = process.argv.slice(2);

if (files.length === 0) {
  console.log("Aucun fichier à traiter.");
  process.exit(0);
}

try {
  for (const file of files) {
    await processFile(file);
  }
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "Erreur inconnue pendant la publication Facebook."
  );
  process.exitCode = 1;
}
