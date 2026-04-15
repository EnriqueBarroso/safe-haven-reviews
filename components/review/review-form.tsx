"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Step1ProfileInfo } from "./steps/step-1-profile-info"
import { Step2Ratings } from "./steps/step-2-ratings"
import { Step3Details } from "./steps/step-3-details"
import { Step4Written } from "./steps/step-4-written"
import { Step5Alias } from "./steps/step-5-alias"
import { Check, Loader2, AlertCircle } from "lucide-react"

export interface ReviewFormData {
  name: string
  city: string
  platform: string
  veracity: number
  punctuality: number
  communication: number
  hygiene: number
  overall: number
  valuePrice: number
  price: string
  duration: string
  details: string
  genuineExperience: boolean
  alias: string
}

const initialFormData: ReviewFormData = {
  name: "",
  city: "",
  platform: "",
  veracity: 0,
  punctuality: 0,
  communication: 0,
  hygiene: 0,
  overall: 0,
  valuePrice: 50,
  price: "",
  duration: "",
  details: "",
  genuineExperience: false,
  alias: "Usuario" + Math.floor(Math.random() * 9000 + 1000),
}

const steps = [
  { title: "Info. del Perfil", description: "Información básica" },
  { title: "Valoraciones", description: "Puntuaciones detalladas" },
  { title: "Detalles", description: "Precio y duración" },
  { title: "Reseña Escrita", description: "Tu experiencia" },
  { title: "Confirmación", description: "Pseudónimo" },
]

export function ReviewForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ReviewFormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const router = useRouter()

  const progress = ((currentStep + 1) / steps.length) * 100

  const updateFormData = (updates: Partial<ReviewFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = () => {
    console.log("Guardando borrador:", formData)
    // TODO: Implementar guardado de borrador (opcional para el futuro)
  }

  // --- LA MAGIA OCURRE AQUÍ ---
  const handlePublish = async () => {
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      // 1. Comprobar sesión
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        throw new Error("Debes iniciar sesión para publicar una reseña.")
      }

      let profileId = null;

      // 2. INTELIGENCIA: Buscar si el perfil ya existe (ignorando mayúsculas/minúsculas)
      const { data: existingProfile, error: searchError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('name', formData.name.trim())
        .ilike('city', formData.city.trim())
        .maybeSingle() // maybeSingle devuelve el dato si existe, o null si no hay ninguno (sin dar error)

      if (searchError) throw searchError

      if (existingProfile) {
        // ¡El perfil ya existe! Usamos su ID
        profileId = existingProfile.id
      } else {
        // 3. El perfil no existe, lo creamos nuevo
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            name: formData.name.trim(),
            city: formData.city.trim(),
            platform: formData.platform || null,
          })
          .select()
          .single()

        if (profileError) throw profileError
        profileId = newProfile.id
      }

      // 4. Insertar la Reseña vinculándola al profileId correcto
      const { error: reviewError } = await supabase
        .from('reviews')
        .insert({
          profile_id: profileId,
          user_id: session.user.id,
          alias: formData.alias,
          veracity: formData.veracity,
          punctuality: formData.punctuality,
          communication: formData.communication,
          hygiene: formData.hygiene,
          overall: formData.overall,
          value_price: formData.valuePrice,
          price: Number(formData.price),
          duration: Number(formData.duration),
          details: formData.details,
          genuine_experience: formData.genuineExperience,
          status: 'published'
        })

      if (reviewError) throw reviewError

      // 5. Éxito: Redirigimos al perfil que acabamos de reseñar para que vea su obra
      router.push(`/profiles/${profileId}?success=true`)

    } catch (error: any) {
      console.error("Error publicando:", error)
      setErrorMsg(error.message || "Hubo un error al publicar tu reseña. Inténtalo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== "" && formData.city.trim() !== ""
      case 1:
        return (
          formData.veracity > 0 &&
          formData.punctuality > 0 &&
          formData.communication > 0 &&
          formData.hygiene > 0 &&
          formData.overall > 0
        )
      case 2:
        return formData.price.trim() !== "" && formData.duration.trim() !== ""
      case 3:
        return formData.details.length >= 100 && formData.genuineExperience
      case 4:
        return true
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1ProfileInfo formData={formData} updateFormData={updateFormData} />
      case 1:
        return <Step2Ratings formData={formData} updateFormData={updateFormData} />
      case 2:
        return <Step3Details formData={formData} updateFormData={updateFormData} />
      case 3:
        return <Step4Written formData={formData} updateFormData={updateFormData} />
      case 4:
        return <Step5Alias formData={formData} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="font-medium">
              Paso {currentStep + 1} de {steps.length}
            </span>
            <span className="text-muted-foreground">{steps[currentStep].title}</span>
          </div>
          <Progress value={progress} className="h-2" />

          <div className="mt-6 hidden gap-2 sm:flex">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`flex flex-1 items-center gap-2 rounded-lg border p-3 transition-colors ${index === currentStep
                    ? "border-primary bg-primary/10"
                    : index < currentStep
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-secondary/30"
                  }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-medium ${index < currentStep
                      ? "bg-primary text-primary-foreground"
                      : index === currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                >
                  {index < currentStep ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="hidden min-w-0 lg:block">
                  <p className="truncate text-xs font-medium">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 md:p-8">{renderStep()}</CardContent>
      </Card>

      {/* Mensaje de error general si falla la subida */}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0 || isSubmitting}
        >
          Anterior
        </Button>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleSaveDraft} disabled={isSubmitting}>
            Guardar Borrador
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep} disabled={!canProceed()}>
              Continuar
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={!canProceed() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                "Publicar Reseña"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}