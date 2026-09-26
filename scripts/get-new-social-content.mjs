import { execFileSync } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
const ZERO_SHA = /^0+$/;
const CONTENT_DIRECTORIES = [
  "src/content/realisations",
  "src/content/conseils",
  "src/content/actualites",
];

function gitOutput(args, options = {}) {
  return execFileSync("git", args, {
    encoding: null,
    ...options,
  });
}

function commitExists(ref) {
  try {
    execFileSync("git", ["cat-file", "-e", `${ref}^{commit}`], {
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

function getEmptyTree() {
  return gitOutput(["hash-object", "-t", "tree", "--stdin"], {
    input: Buffer.alloc(0),
  })
    .toString("ascii")
    .trim();
}

async function getMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await getMarkdownFiles(entryPath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(entryPath.split(path.sep).join("/"));
    }
  }

  return files;
}

async function writeAllContentFiles() {
  const files = (
    await Promise.all(CONTENT_DIRECTORIES.map(getMarkdownFiles))
  )
    .flat()
    .sort();

  for (const file of files) {
    process.stdout.write(`${file}\0`);
  }
}

let gitArgs;

if (args[0] === "--all") {
  await writeAllContentFiles();
} else if (args[0] === "--cached") {
  gitArgs = [
    "diff",
    "--cached",
    "--name-only",
    "-z",
    "--diff-filter=A",
    "--",
    "src/content/realisations/*.md",
    "src/content/conseils/*.md",
    "src/content/actualites/*.md",
  ];
} else {
  let base = args[0];
  const head = args[1] ?? "HEAD";

  if (!base) {
    console.error("Commit de base manquant.");
    process.exit(1);
  }

  if (ZERO_SHA.test(base)) {
    base = getEmptyTree();
  } else if (!commitExists(base)) {
    console.error(
      `Avertissement : commit de base introuvable (${base}). Aucune publication Facebook ne sera tentée.`
    );
    process.exit(0);
  }

  gitArgs = [
    "diff",
    "--name-only",
    "-z",
    "--diff-filter=A",
    base,
    head,
    "--",
    "src/content/realisations/*.md",
    "src/content/conseils/*.md",
    "src/content/actualites/*.md",
  ];
}

if (gitArgs) {
  const output = gitOutput(gitArgs);
  process.stdout.write(output);
}
