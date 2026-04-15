"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Save, Upload, User } from "lucide-react"

interface ProfileTabProps {
  user: any
  alias: string
  customAvatarUrl: string
  uploading: boolean
  updating: boolean
  saveMsg: { type: "success" | "error"; text: string } | null
  onAliasChange: (alias: string) => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
}

export function ProfileTab({
  user,
  alias,
  customAvatarUrl,
  uploading,
  updating,
  saveMsg,
  onAliasChange,
  onFileUpload,
  onSubmit,
}: ProfileTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tu Identidad en la Comunidad</CardTitle>
        <CardDescription>
          Esta es la imagen y el nombre que otros verán en tus reseñas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Avatar */}
        <div className="flex flex-col items-start gap-4">
          <Label>Foto de Perfil</Label>
          <div className="relative h-32 w-32">
            <div className="h-full w-full overflow-hidden rounded-2xl border-4 border-background bg-secondary shadow-xl">
              {customAvatarUrl ? (
                <img src={customAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <Button
              size="icon"
              variant="secondary"
              type="button"
              className="absolute -bottom-2 -right-2 rounded-full shadow-md"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={onFileUpload}
            />
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-6 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="alias">Pseudónimo Público</Label>
            <Input
              id="alias"
              value={alias}
              onChange={(e) => onAliasChange(e.target.value)}
              className="h-12 text-base"
              placeholder="Ej: Lince Nocturno"
              required
            />
            <p className="text-xs text-muted-foreground">
              Este nombre aparecerá en todas tus reseñas.
            </p>
          </div>

          {saveMsg && (
            <div className={`text-sm p-3 rounded-md ${
              saveMsg.type === "error"
                ? "bg-destructive/15 text-destructive"
                : "bg-primary/15 text-primary"
            }`}>
              {saveMsg.text}
            </div>
          )}

          <Button type="submit" disabled={updating || uploading} className="w-full h-12">
            {updating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Guardar Identidad Pública
          </Button>
        </form>

        {/* Info cuenta */}
        <div className="rounded-lg border border-border bg-secondary/30 p-4 max-w-md">
          <p className="text-xs text-muted-foreground font-medium mb-1">Cuenta vinculada</p>
          <p className="text-sm font-medium">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tu email es privado y nunca se muestra públicamente.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}