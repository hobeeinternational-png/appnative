export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function sendJson(response, status, body) {
  response.status(status).json(body);
}

export function sendApiError(response, error) {
  if (error instanceof ApiError) {
    return sendJson(response, error.status, {
      error: { code: error.code, message: error.message, details: error.details },
    });
  }
  console.error("[HOBEE API] unexpected error", error);
  return sendJson(response, 500, { error: { code: "internal_error", message: "เกิดข้อผิดพลาดภายในระบบ" } });
}

export function requireMethod(request, response, method) {
  if (request.method === method) return;
  response.setHeader("Allow", method);
  throw new ApiError(405, "method_not_allowed", `รองรับเฉพาะ ${method}`);
}

export function getBearerToken(request) {
  const header = request.headers?.authorization ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match?.[1]) throw new ApiError(401, "unauthorized", "ไม่พบ Supabase bearer token");
  return match[1];
}

export async function readRawBody(request) {
  if (typeof request.body === "string") return request.body;
  if (Buffer.isBuffer(request.body)) return request.body.toString("utf8");
  if (request.body && typeof request.body === "object") return JSON.stringify(request.body);

  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

export function parseJson(rawBody) {
  try {
    return JSON.parse(rawBody);
  } catch {
    throw new ApiError(400, "invalid_json", "เนื้อหาคำขอไม่ใช่ JSON ที่ถูกต้อง");
  }
}

