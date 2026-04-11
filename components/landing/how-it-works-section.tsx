import { Mail, Search, PenLine } from "lucide-react"

const steps = [
  {
    icon: Mail,
    title: "Register Privately",
    description:
      "Sign up with your real email for verification. Your email stays completely private and is never shared or displayed.",
  },
  {
    icon: Search,
    title: "Browse Anonymously",
    description:
      "Access verified reviews from real users. Browse profiles and read detailed experiences without revealing your identity.",
  },
  {
    icon: PenLine,
    title: "Contribute Safely",
    description:
      "Share your genuine experiences. Your reviews are published under a unique pseudonym, protecting your privacy.",
  },
]

export function HowItWorksSection() {
  return (
    <section className="border-b border-border/40 bg-card py-20">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A simple, secure process designed to protect your privacy at every step
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="group relative rounded-2xl border border-border/60 bg-background p-8 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="absolute -top-4 left-8">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </span>
              </div>
              
              <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              
              <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
