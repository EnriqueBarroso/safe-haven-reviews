import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, city, category")
    .eq("slug", slug)
    .single()

  if (!profile) {
    return { title: "Perfil no encontrado — YaFui" }
  }

  return {
    title: `${profile.name} en ${profile.city} — YaFui`,
    description: `Lee reseñas y preguntas del foro sobre ${profile.name} en ${profile.city}. Opiniones reales de la comunidad YaFui.`,
    openGraph: {
      title: `${profile.name} en ${profile.city} — YaFui`,
      description: `Opiniones reales de la comunidad sobre ${profile.name} en ${profile.city}.`,
      images: [{ url: "/yafui-og-image.png", width: 1200, height: 630 }],
    },
  }
}

export default function ProfileSlugLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
