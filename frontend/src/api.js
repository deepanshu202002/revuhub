const API_BASE = import.meta.env.VITE_REACT_APP_BACKEND_URL;

export async function api(path, { method = "GET", body, token, headers } = {}) {
  console.log("token only", token);
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "API error");
  }

  return res.json();
}

// Batch presigned URLs for multiple files
export async function signPresignedBatch({ type, files, token }) {
  return api("/api/uploads/presigned-batch", {
    method: "POST",
    token,
    body: { type, files },
  });
}

// Single presigned URL for one file
export async function signPresignedSingle({ file, type, token }) {
  return api("/api/uploads/presigned-url", {
    method: "POST",
    token,
    body: {
      type, // e.g., "product" or "profile"
      filetype: file.type,
    },
  });
}
