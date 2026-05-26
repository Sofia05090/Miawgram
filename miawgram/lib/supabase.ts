import { createClient } from "@supabase/supabase-js";
import { CatImage } from "./cataas";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// CLIENTE OFICIAL
export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// HEADERS REST
const headers = () => ({
  "Content-Type": "application/json",
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
});

// SIGN UP
export async function signUpUser(
  correo: string,
  password: string
) {
  const { data, error } =
    await supabase.auth.signUp({
      email: correo,
      password,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

interface UsuarioPayload {
  nombre: string;
  correo: string;
  nickname: string | null;
  telefono: string | null;
  fecha_cumple: string | null;
}

// INSERT USER
export async function insertUsuario(
  authUserId: string,
  payload: UsuarioPayload
) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/usuarios`,
    {
      method: "POST",
      headers: {
        ...headers(),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        auth_user_id: authUserId,
        ...payload,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Error al guardar usuario"
    );
  }

  return data[0];
}

// UPSERT IMAGE
export async function upsertImagen({
  id_imagen,
  url_imagen,
  ancho,
  alto,
}: CatImage) {
  const checkRes = await fetch(
    `${SUPABASE_URL}/rest/v1/imagenes?id_imagen=eq.${id_imagen}&select=id`,
    {
      headers: headers(),
    }
  );

  const existing = await checkRes.json();

  if (existing?.length > 0) {
    return existing[0];
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/imagenes`,
    {
      method: "POST",
      headers: {
        ...headers(),
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id_imagen,
        url_imagen,
        ancho,
        alto,
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Error al guardar imagen"
    );
  }

  return data[0];
}