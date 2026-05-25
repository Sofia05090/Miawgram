"use client";

import { useState } from "react";
import styles from "./LoginScreen.module.css";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface FormState {
  correo: string;
  password: string;
}

interface FormErrors {
  correo?: string;
  password?: string;
}

interface Toast {
  msg: string;
  type: "success" | "error";
}

async function signInUser(correo: string, password: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ email: correo, password }),
  });
  const data = await res.json();
  console.log("Supabase response:", res.status, data);
  if (!res.ok) throw new Error(data.error_description || data.msg || "Credenciales incorrectas");
  return data;
}

interface Props {
  onGoRegister?: () => void;
  onLogin?: () => void;
}

export default function LoginScreen({ onGoRegister, onLogin}: Props) {
  const [form, setForm] = useState<FormState>({ correo: "", password: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [focused, setFocused] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

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
    if (!form.correo.trim()) e.correo = "El correo es obligatorio";
    else if (!/^\S+@\S+\.\S+$/.test(form.correo)) e.correo = "Formato inválido";
    if (!form.password) e.password = "La contraseña es obligatoria";
    return e;
  };

  const handleSubmit = async () => {
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setSubmitting(true);
    try {
      await signInUser(form.correo, form.password);
      showToast("¡Bienvenido/a de nuevo! 🐱", "success");
      setTimeout(() => onLogin?.(), 1000);
      // TODO: router.push("/feed")
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormState) =>
    [styles.input, focused[field] ? styles.inputFocused : "", errors[field] ? styles.inputError : ""]
      .filter(Boolean)
      .join(" ");

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
          <div className={styles.logoSub}>Inicia sesión</div>
        </div>

        <div className={styles.fGroup}>
          <label className={styles.label}>Correo electrónico</label>
          <input
            className={inputClass("correo")}
            type="email"
            placeholder="correo@ejemplo.com"
            value={form.correo}
            onChange={set("correo")}
            onFocus={focus("correo", true)}
            onBlur={focus("correo", false)}
          />
          {errors.correo && <p className={styles.errorText}>{errors.correo}</p>}
        </div>

        <div className={styles.fGroup}>
          <label className={styles.label}>Contraseña</label>
          <div className={styles.passWrap}>
            <input
              className={inputClass("password")}
              type={showPass ? "text" : "password"}
              placeholder="Tu contraseña"
              value={form.password}
              onChange={set("password")}
              onFocus={focus("password", true)}
              onBlur={focus("password", false)}
            />
            <button
              type="button"
              className={styles.showPassBtn}
              onClick={() => setShowPass((p) => !p)}
            >
              {showPass ? "ocultar" : "mostrar"}
            </button>
          </div>
          {errors.password && <p className={styles.errorText}>{errors.password}</p>}
        </div>

        <p className={styles.forgotPass}>
          <span
            className={styles.forgotSpan}
            onClick={() => showToast("Revisa tu correo para restablecer la contraseña", "success")}
          >
            ¿Olvidaste tu contraseña?
          </span>
        </p>

        <div className={styles.divider}>
          <div className={styles.divLine} />
          <span className={styles.divText}>o continúa con tu cuenta</span>
          <div className={styles.divLine} />
        </div>

        <button
          type="button"
          className={`${styles.btn} ${submitting ? styles.btnDisabled : ""}`}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Iniciando sesión..." : "Iniciar sesión 🐾"}
        </button>

        <p className={styles.registerLink}>
          ¿No tienes cuenta?{" "}
          <span className={styles.registerSpan} onClick={() => onGoRegister?.()}>
            Regístrate
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
