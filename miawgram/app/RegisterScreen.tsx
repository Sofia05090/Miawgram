"use client";

import { useState, useEffect } from "react";
import styles from "./RegisterScreen.module.css";
import { signUpUser, insertUsuario, upsertImagen } from "@/lib/supabase";
import { fetchCatImages, CatImage } from "@/lib/cataas";

interface FormState {
  nombre: string;
  nickname: string;
  correo: string;
  password: string;
  telefono: string;
  fecha_cumple: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

interface Toast {
  msg: string;
  type: "success" | "error";
}

interface Props {
  onGoLogin?: () => void;
}

function CatGrid({
  cats,
  selected,
  onSelect,
  loading,
  onRefresh,
}: {
  cats: CatImage[];
  selected: CatImage | null;
  onSelect: (cat: CatImage) => void;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className={styles.fGroup}>
      <label className={styles.catSectionLabel}>Tu foto de perfil — elige un gato 🐾</label>
      <div className={styles.catSection}>
        <button type="button" className={styles.refreshBtn} onClick={onRefresh} disabled={loading}>
          {loading ? "..." : "↻ nuevos"}
        </button>

        {loading ? (
          <div className={styles.catLoader}>Cargando gatos...</div>
        ) : (
          <div className={styles.catGrid}>
            {cats.map((cat, i) => (
              <div
                key={cat.id_imagen ?? `cat-${i}`}
                onClick={() => onSelect(cat)}
                className={`${styles.catTile} ${selected?.id_imagen === cat.id_imagen ? styles.catTileSelected : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.url_imagen}
                  alt={`Gato ${i + 1}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://cataas.com/cat?r=${i}`; }}
                />
                {selected?.id_imagen === cat.id_imagen && (
                  <div className={styles.catCheck}>✓</div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className={styles.catOverlay}>
            {selected?.id_imagen
              ? `Seleccionado: ${selected.id_imagen.slice(0, 10)}…`
              : "Toca una foto para elegirla"
            }
         </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={styles.fGroup}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}

export default function RegisterScreen({ onGoLogin }: Props) {
  const [cats, setCats] = useState<CatImage[]>([]);
  const [selectedCat, setSelectedCat] = useState<CatImage | null>(null);
  const [loadingCats, setLoadingCats] = useState(true);
  const [form, setForm] = useState<FormState>({
    nombre: "", nickname: "", correo: "", password: "", telefono: "", fecha_cumple: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [focused, setFocused] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => { loadCats(); }, []);

  const loadCats = async () => {
    setLoadingCats(true);
    try {
      const data = await fetchCatImages(6);
      setCats(data);
      setSelectedCat(data[0] ?? null);
    } catch {
      showToast("No se pudieron cargar los gatos 😿", "error");
    } finally {
      setLoadingCats(false);
    }
  };

  const showToast = (msg: string, type: Toast["type"] = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4500);
  };

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const focus = (field: keyof FormState, val: boolean) => () =>
    setFocused((p) => ({ ...p, [field]: val }));

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    else if (form.nombre.length > 30) e.nombre = "Máximo 30 caracteres";
    if (!form.correo.trim()) e.correo = "El correo es obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(form.correo)) e.correo = "Formato inválido";
    if (!form.password) e.password = "La contraseña es obligatoria";
    else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (form.nickname && form.nickname.length > 50) e.nickname = "Máximo 50 caracteres";
    if (form.telefono && !/^\d{10}$/.test(form.telefono)) e.telefono = "Exactamente 10 dígitos";
    return e;
  };

  const handleSubmit = async () => {
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    if (!selectedCat) { showToast("Elige una foto de gato 🐾", "error"); return; }
    setSubmitting(true);
    try {
      const authData = await signUpUser(form.correo, form.password);
      const authUserId: string = authData.user?.id;
      if (!authUserId) throw new Error("No se obtuvo el ID de autenticación");
      await upsertImagen(selectedCat);
      await insertUsuario(authUserId, {
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        nickname: form.nickname.trim() || null,
        telefono: form.telefono.trim() || null,
        fecha_cumple: form.fecha_cumple || null,
      });
      showToast("¡Cuenta creada! 🎉\nRevisa tu correo para confirmar.", "success");
      setForm({ nombre: "", nickname: "", correo: "", password: "", telefono: "", fecha_cumple: "" });
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormState) =>
    [styles.input, focused[field] ? styles.inputFocused : "", errors[field] ? styles.inputError : ""]
      .filter(Boolean).join(" ");

  const inp = (field: keyof FormState) => ({
    className: inputClass(field),
    value: form[field],
    onChange: set(field),
    onFocus: focus(field, true),
    onBlur: focus(field, false),
  });

  return (
    <div className={styles.root}>
      <div className={styles.particles}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${(i * 19 + 7) % 100}%`,
              bottom: `${(i * 13) % 35}%`,
              width: i % 2 === 0 ? 7 : 4,
              height: i % 2 === 0 ? 7 : 4,
              animationDuration: `${7 + (i % 5)}s`,
              animationDelay: `${i * 0.9}s`,
            }}
          />
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <div className={styles.logoIcon}>🐱</div>
          <div className={styles.logoTitle}>CatGram</div>
          <div className={styles.logoSub}>Crea tu cuenta</div>
        </div>

        <CatGrid cats={cats} selected={selectedCat} onSelect={setSelectedCat} loading={loadingCats} onRefresh={loadCats} />

        <div className={styles.grid2}>
          <Field label="Nombre *" error={errors.nombre}>
            <input {...inp("nombre")} placeholder="Tu nombre" maxLength={30} />
          </Field>
          <Field label="Usuario" error={errors.nickname}>
            <input {...inp("nickname")} placeholder="@nickname" maxLength={50} />
          </Field>
        </div>

        <Field label="Correo electrónico *" error={errors.correo}>
          <input {...inp("correo")} type="email" placeholder="correo@ejemplo.com" />
        </Field>

        <Field label="Contraseña *" error={errors.password}>
          <input {...inp("password")} type="password" placeholder="Mínimo 6 caracteres" />
        </Field>

        <div className={styles.grid2}>
          <Field label="Teléfono" error={errors.telefono}>
            <input {...inp("telefono")} type="tel" placeholder="3001234567" maxLength={10} />
          </Field>
          <Field label="Cumpleaños">
            <input {...inp("fecha_cumple")} type="date" />
          </Field>
        </div>

        <div className={styles.divider}>
          <div className={styles.divLine} />
          <span className={styles.divText}>campos * requeridos</span>
          <div className={styles.divLine} />
        </div>

        <button
          type="button"
          className={`${styles.btn} ${submitting ? styles.btnDisabled : ""}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Creando cuenta..." : "Crear cuenta 🐾"}
        </button>

        <p className={styles.loginLink}>
          ¿Ya tienes cuenta?{" "}
          <span className={styles.loginSpan} onClick={() => onGoLogin?.()}>
            Inicia sesión
          </span>
        </p>
      </div>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}