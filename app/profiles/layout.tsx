import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Explorar Perfiles — YaFui",
  description: "Busca perfiles, lee reseñas reales y consulta las últimas preguntas del foro de la comunidad YaFui.",
}

export default function ProfilesLayout({ children }: { children: React.ReactNode }) {
  return children
}