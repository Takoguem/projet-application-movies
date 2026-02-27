const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
 
export async function apiFetch(path, options = {}) {

  const url = `${API_BASE_URL}${path}`;
 
  const res = await fetch(url, {

    headers: {

      "Content-Type": "application/json",

      ...(options.headers || {}),

    },

    ...options,

  });
 
  const contentType = res.headers.get("content-type") || "";

  const isJson = contentType.includes("application/json");

  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
 
  if (!res.ok) {

    const message =

      (data && typeof data === "object" && (data.message || data.error)) ||

      (typeof data === "string" && data) ||

      `Erreur API (${res.status})`;

    throw new Error(message);

  }
 
  return data;

}
 