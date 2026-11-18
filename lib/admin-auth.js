import jwt from "jsonwebtoken";

export const ADMIN_COOKIE_NAME = "lr_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET debe existir y tener al menos 32 caracteres.");
  }
  return secret;
}

export function createAdminToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), role: "admin" },
    getSecret(),
    { expiresIn: SESSION_SECONDS, issuer: "locura-realidad", audience: "locura-realidad-admin" }
  );
}

export function verifyAdminToken(token) {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getSecret(), {
      issuer: "locura-realidad",
      audience: "locura-realidad-admin",
    });
    if (!payload || typeof payload !== "object" || payload.role !== "admin" || !payload.sub) {
      return null;
    }
    return { id: payload.sub, role: "admin" };
  } catch {
    return null;
  }
}

function readCookie(req, name) {
  // NextRequest exposes cookies.get(); standard Request exposes the Cookie header.
  const nextCookie = req?.cookies?.get?.(name);
  if (nextCookie?.value) return nextCookie.value;

  const cookieHeader = req?.headers?.get?.("cookie") || "";
  const entry = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

export function getAdminSessionFromRequest(req) {
  return verifyAdminToken(readCookie(req, ADMIN_COOKIE_NAME));
}

export function isAdmin(req) {
  return Boolean(getAdminSessionFromRequest(req));
}

export function unauthorizedResponse() {
  return Response.json({ error: "No autorizado. Iniciá sesión para continuar." }, {
    status: 401,
    headers: { "Cache-Control": "no-store" },
  });
}

export function requireAdmin(req) {
  return isAdmin(req) ? null : unauthorizedResponse();
}

export const ADMIN_SESSION_MAX_AGE = SESSION_SECONDS;
