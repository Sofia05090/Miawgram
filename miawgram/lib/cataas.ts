export interface CatImage {
  id_imagen: string;
  url_imagen: string;
  ancho: number | null;
  alto: number | null;
}

export async function fetchCatImages(count = 6): Promise<CatImage[]> {
  // La API nueva usa /api/cats con paginación distinta
  const res = await fetch(
    `https://cataas.com/api/cats?limit=${count}&skip=${Math.floor(Math.random() * 50)}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("No se pudieron cargar los gatos");

  const cats = await res.json();

  // La respuesta nueva viene en .data o directo como array
  const list = Array.isArray(cats) ? cats : (cats.data ?? []);

  return list
    .filter((cat: { id?: string; _id?: string }) => !!(cat.id || cat._id))
    .slice(0, count)
    .map((cat: { id?: string; _id?: string; width?: number; height?: number }) => {
      const id = cat.id ?? cat._id ?? "";
      return {
        id_imagen: id,
        url_imagen: `https://cataas.com/cat/${id}`,
        ancho: cat.width ?? null,
        alto: cat.height ?? null,
      };
    });
}