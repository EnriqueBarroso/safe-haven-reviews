import { ShieldCheck, Star, Users } from "lucide-react"

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-secondary/30 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">¿Por qué usar YaFui?</h2>
          <p className="text-muted-foreground">Una plataforma diseñada pensando en tu seguridad y en la calidad de la información.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Identidad Protegida</h3>
            <p className="text-muted-foreground leading-relaxed">
              Usa un pseudónimo y un avatar generado. Tu correo electrónico y datos reales jamás serán compartidos ni visibles para nadie.
            </p>
          </div>
          
          <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Reseñas Detalladas</h3>
            <p className="text-muted-foreground leading-relaxed">
              No solo estrellas. Valora la higiene, puntualidad, comunicación y relación calidad-precio para ayudar a otros a decidir.
            </p>
          </div>
          
          <div className="bg-background p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Comunidad Activa</h3>
            <p className="text-muted-foreground leading-relaxed">
              Miles de usuarios compartiendo sus experiencias reales cada día. Evita sorpresas desagradables y ve sobre seguro.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}