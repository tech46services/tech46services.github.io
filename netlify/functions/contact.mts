const ALLOWED_ORIGIN = "https://tech46services.fr";
const PHONE_PATTERN = /^0[1-9][0-9]{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  Vary: "Origin",
};

const jsonResponse = (body: object, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
    },
  });

const invalidResponse = (): Response =>
  jsonResponse({ success: false, message: "Données invalides." }, 400);

const successResponse = (): Response => jsonResponse({ success: true }, 200);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export default async (request: Request): Promise<Response> => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      headers: {
        ...corsHeaders,
        Allow: "POST, OPTIONS",
      },
    });
  }

  const origin = request.headers.get("Origin");
  if (origin !== null && origin !== ALLOWED_ORIGIN) {
    return new Response(null, { status: 403, headers: corsHeaders });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return invalidResponse();
  }

  if (!isRecord(body)) {
    return invalidResponse();
  }

  const botcheck =
    typeof body.botcheck === "string" ? body.botcheck.trim() : body.botcheck;

  if (botcheck !== undefined && botcheck !== null && botcheck !== "") {
    return successResponse();
  }

  if (
    typeof body.name !== "string" ||
    typeof body.phonenumber !== "string" ||
    typeof body.email !== "string" ||
    typeof body.message !== "string"
  ) {
    return invalidResponse();
  }

  const name = body.name.trim();
  const phonenumber = body.phonenumber.trim();
  const email = body.email.trim();
  const message = body.message.trim();

  const isValid =
    name.length > 0 &&
    name.length <= 100 &&
    PHONE_PATTERN.test(phonenumber) &&
    email.length > 0 &&
    email.length <= 254 &&
    EMAIL_PATTERN.test(email) &&
    message.length > 0 &&
    message.length <= 5000;

  return isValid ? successResponse() : invalidResponse();
};

export const config = {
  path: "/api/contact",
  rateLimit: {
    action: "rate_limit",
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
