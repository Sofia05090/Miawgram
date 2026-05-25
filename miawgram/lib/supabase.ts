import { CatImage } from "./cataas";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const headers = () => ({
  "Content-Type": "application/json",
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
});

export async function signUpUser(correo: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ email: correo, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || data.message || "Error al crear cuenta");
  return data;
}

interface UsuarioPayload {
  nombre: string;
  correo: string;
  nickname: string | null;
  telefono: string | null;
  fecha_cumple: string | null;
}

export async function insertUsuario(authUserId: string, payload: UsuarioPayload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify({ auth_user_id: authUserId, ...payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al guardar usuario");
  return data[0];
}

export async function upsertImagen({ id_imagen, url_imagen, ancho, alto }: CatImage) {
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/imagenes?id_imagen=eq.${id_imagen}&select=id`,
    { headers: headers() }
  );
  const existing = await checkRes.json();
  if (existing?.length > 0) return existing[0];

  const res = await fetch(`${SUPABASE_URL}/rest/v1/imagenes`, {
    method: "POST",
    headers: { ...headers(), Prefer: "return=representation" },
    body: JSON.stringify({ id_imagen, url_imagen, ancho, alto }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al guardar imagen");
  return data[0];
}