"use client";

import { useState } from "react";
import styles from "./LoginScreen.module.css";
import { supabase } from "@/lib/supabase";

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

interface Props {
  onGoRegister?: () => void;
}

export default function LoginScreen({
  onGoRegister,
}: Props) {
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

  if (Object.keys(v).length) {
    setErrors(v);
    return;
  }

  setSubmitting(true);

  try {
    const { error } =
      await supabase.auth.signInWithPassword({
        email: form.correo,
        password: form.password,
      });

    if (error) {
      throw error;
    }

    showToast(
      "¡Bienvenido/a de nuevo! 🐱",
      "success"
    );

  } catch (err) {
    showToast(
      (err as Error).message,
      "error"
    );
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
