"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Send, Bookmark } from "lucide-react";

interface CatPost {
  id: string;
  imageUrl: string;
  likes: number;
  description: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<CatPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generatePosts = async () => {
      try {
        // Crear varias publicaciones falsas usando la API de Cataas
        const newPosts: CatPost[] = Array.from({ length: 10 }).map(
          (_, index) => ({
            id: `${index}`,
            imageUrl: `https://cataas.com/cat?random=${index}`,
            likes: Math.floor(Math.random() * 5000) + 100,
            description: descriptions[
              Math.floor(Math.random() * descriptions.length)
            ],
          })
        );

        setPosts(newPosts);
      } catch (error) {
        console.error("Error cargando gatos:", error);
      } finally {
        setLoading(false);
      }
    };

    generatePosts();
  }, []);

  const descriptions = [
    "Durmiendo todo el día 😴",
    "Modo cazador activado 🐈",
    "Demasiado adorable ❤️",
    "El rey de la casa 👑",
    "Posando para la foto 📸",
    "Esperando comida 🍖",
    "Gatito explorador 🌎",
    "Odio los lunes 😾",
    "Devorador de almas 👻",
  ];

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-black text-white">
        <p className="text-lg animate-pulse">Cargando gatos...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-black">
        <h1 className="text-2xl font-bold tracking-wide">
          Catstagram 🐱
        </h1>

        <div className="flex gap-4">
          <Heart className="w-6 h-6 cursor-pointer" />
          <Send className="w-6 h-6 cursor-pointer" />
        </div>
      </header>

      {/* FEED */}
      <section className="max-w-xl mx-auto">
        {posts.map((post) => (
          <article
            key={post.id}
            className="border-b border-zinc-800 mb-6"
          >
            {/* USER INFO */}
            <div className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700">
                <Image
                  src={`https://cataas.com/cat?random=profile-${post.id}`}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>

              <div>
                <p className="font-semibold">gato_{post.id}</p>
                <p className="text-xs text-zinc-400">Medellín, Colombia</p>
              </div>
            </div>

            {/* IMAGE */}
            <div className="relative w-full aspect-square bg-zinc-900">
              <Image
                src={post.imageUrl}
                alt="Cat post"
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* ACTIONS */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex gap-4">
                <Heart className="w-7 h-7 cursor-pointer hover:scale-110 transition" />
                <MessageCircle className="w-7 h-7 cursor-pointer hover:scale-110 transition" />
                <Send className="w-7 h-7 cursor-pointer hover:scale-110 transition" />
              </div>

              <Bookmark className="w-7 h-7 cursor-pointer hover:scale-110 transition" />
            </div>

            {/* LIKES & DESCRIPTION */}
            <div className="px-4 pb-5">
              <p className="font-semibold mb-1">
                {post.likes.toLocaleString()} likes
              </p>

              <p className="text-sm">
                <span className="font-semibold mr-2">
                  gato_{post.id}
                </span>
                {post.description}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}