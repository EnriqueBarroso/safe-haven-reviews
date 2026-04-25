"use client"

import { useState, useEffect } from "react"
import { ShieldAlert, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AgeVerification() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Comprobamos si ya aceptó anteriormente
    const isVerified = localStorage.getItem("yafui-age-verified")
    if (!isVerified) {
      setShow(true)
    }
  }, [])

  const handleVerify = () => {
    localStorage.setItem("yafui-age-verified", "true")
    setShow(false)
  }

  const handleReject = () => {
    window.location.href = "https://www.google.com"
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f]/95 backdrop-blur-md px-4">
      <div className="max-w-md w-full border border-primary/30 bg-[#0a0a0f] p-8 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,255,135,0.3)] text-center">
        
        {/* ICONO ESCUDO NEÓN */}
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
          <ShieldAlert className="h-8 w-8 text-[#00ff87]" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
          Control de Acceso
        </h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Esta plataforma contiene experiencias reales y opiniones que pueden no ser aptas para menores. 
          Al entrar, confirmas que tienes <span className="text-[#00ff87] font-semibold">18 años o más</span> y aceptas nuestras reglas de comunidad.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={handleReject}
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
          >
            <X className="mr-2 h-4 w-4" /> Soy menor
          </Button>
          
          <Button 
            onClick={handleVerify}
            className="bg-[#00ff87] text-black hover:bg-[#00ff87]/90 shadow-[0_0_15px_rgba(0,255,135,0.4)]"
          >
            <Check className="mr-2 h-4 w-4" /> Soy mayor
          </Button>
        </div>

        <p className="mt-6 text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">
          YaFui • Comunidad Segura
        </p>
      </div>
    </div>
  )
}