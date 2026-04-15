"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Camera, User, ShieldCheck } from "lucide-react"

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [username, setUsername] = useState("")
  const [pseudonym, setPseudonym] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_profiles')
        .select('username, pseudonym, avatar_url')
        .eq('id', user.id)
        .single()

      if (data) {
        setUsername(data.username || "")
        setPseudonym(data.pseudonym || "")
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      console.error('Error cargando perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault()
    setUpdating(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No hay usuario")

      const updates = {
        id: user.id,
        username,
        pseudonym,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('user_profiles').upsert(updates)
      if (error) throw error
      alert("¡Perfil actualizado con éxito!")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUpdating(false)
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUpdating(true)
      if (!event.target.files || event.target.files.length === 0) throw new Error('Selecciona una imagen')

      const file = event.target.files[0]
      const { data: { user } } = await supabase.auth.getUser()
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
      setAvatarUrl(publicUrl)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6 text-primary" /> Mi Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-6">
            {/* Gestión del Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-secondary">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-full w-full p-4 text-muted-foreground" />
                )}
                <label className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90">
                  <Camera className="h-4 w-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={uploadAvatar} disabled={updating} />
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Sube una foto o un avatar representativo</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario (Privado)</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tu nombre real" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pseudonym">Seudónimo (Público)</Label>
              <Input id="pseudonym" value={pseudonym} onChange={(e) => setPseudonym(e.target.value)} placeholder="Ej: ViajeroSeguro88" />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-primary" />
                Este nombre es el que verán los demás en tus reseñas.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={updating}>
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar Cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}