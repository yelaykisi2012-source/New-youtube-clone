export async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new Error(
      "API server javobi noto‘g‘ri. Iltimos, npm start bilan ilovani qayta ishga tushiring.",
    );
  }

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error("API serverdan noto‘g‘ri javob keldi. Keyinroq qayta urinib ko‘ring.");
  }

  if (!response.ok) {
    throw new Error(result.error || "So‘rovni bajarib bo‘lmadi.");
  }

  return result;
}
