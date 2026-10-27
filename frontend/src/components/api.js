const defaultApiUrl = process.env.NODE_ENV === "production"
  ? "https://medqueuebackend.vercel.app/api"
  : "http://localhost:5000/api";
const configuredApiUrl = (process.env.NEXT_PUBLIC_API_URL || defaultApiUrl).trim().replace(/\/+$/, "");
export const API_URL = /\/api$/i.test(configuredApiUrl) ? configuredApiUrl : `${configuredApiUrl}/api`;

function apiPath(path) {
  const normalizedPath = `/${String(path).replace(/^\/+/, "")}`;
  return `${API_URL}${normalizedPath.replace(/^\/api(?=\/|$)/i, "")}`;
}

// Send a request to the backend and return its JSON response.
export async function requestApi(path, options = {}) {
  let response;

  try {
    response = await fetch(apiPath(path), {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error("Could not connect to the MedQueue API. Please try again shortly.");
  }

  const responseText = await response.text();
  let result;
  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(response.ok
      ? "The MedQueue API returned an invalid response. Please try again shortly."
      : `The request failed (${response.status}) with an invalid API response.`);
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`The API route ${path} is not available yet.`);
    }

    throw new Error(result.message || `The request failed (${response.status}).`);
  }

  return result;
}
