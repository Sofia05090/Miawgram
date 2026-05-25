export interface CatImage {
  id_imagen: string;
  url_imagen: string;
  ancho: number | null;
  alto: number | null;
}

export async function fetchCatImages(count = 6): Promise<CatImage[]> {
  const res = await fetch(`https://cataas.com/api/cats?limit=${count}&skip=0`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("No se pudieron cargar los gatos");
  const cats = await res.json();
  return cats.map((cat: { _id: string; width?: number; height?: number }) => ({
    id_imagen: cat._id,
    url_imagen: `https://cataas.com/cat/${cat._id}`,
    ancho: cat.width ?? null,
    alto: cat.height ?? null,
  }));
}