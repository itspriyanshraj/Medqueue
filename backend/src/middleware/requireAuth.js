import { createHmac, timingSafeEqual } from "node:crypto";
import User from "../models/user.model.js";

const cookieName = "medqueue_session";
const sessionSecret = process.env.SESSION_SECRET || process.env.MONGODB_URI;

function sign(value) {
  return createHmac("sha256", sessionSecret).update(value).digest("base64url");
}

function readSession(req) {
  const cookieHeader = req.headers.cookie || "";
  const value = cookieHeader.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.sub || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export function setSessionCookie(res, userId) {
  const payload = Buffer.from(JSON.stringify({
    sub: String(userId),
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${cookieName}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=2592000${secure}`);
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${cookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`);
}

export async function requireAuth(req, res, next) {
  const session = readSession(req);
  if (!session) return res.status(401).json({ message: "Please sign in to continue." });

  try {
    const user = await User.findById(session.sub).select("name email role");
    if (!user) return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access is required." });
    }

    next();
  });
}
