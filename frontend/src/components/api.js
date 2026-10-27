const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
export const API_URL = configuredApiUrl.replace(/\/+$/, "");

// Send a request to the backend and return its JSON response.
export async function requestApi(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error("Could not connect to the MedQueue API. Please try again shortly.");
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`The API route ${path} is not available yet.`);
    }

    throw new Error(result.message || `The request failed (${response.status}).`);
  }

  return result;
}
