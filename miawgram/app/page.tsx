"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import LoginScreen from "@/app/LoginScreen";
import RegisterScreen from "@/app/RegisterScreen";
import HomePage from "@/app/Home";

type Screen = "login" | "register";

export default function Page() {
  const [loading, setLoading] = useState(true);

  const [session, setSession] = useState<any>(null);

  const [screen, setScreen] =
    useState<Screen>("login");

  useEffect(() => {
    // sesión inicial
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setLoading(false);
      });

    // escuchar cambios auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        Cargando...
      </main>
    );
  }

  // NO LOGUEADO
  if (!session) {
    if (screen === "login") {
      return (
        <LoginScreen
  onGoRegister={() => setScreen("register")}
/>
      );
    }

    return (
      <RegisterScreen
        onGoLogin={() =>
          setScreen("login")
        }
      />
    );
  }

  // LOGUEADO
  return <HomePage />;
}