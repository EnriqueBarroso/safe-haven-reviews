import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ReviewForm } from "@/components/review/review-form"

export default function SubmitReviewPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Submit a Review
              </h1>
              <p className="mt-3 text-muted-foreground">
                Share your genuine experience to help the community make informed decisions
              </p>
            </div>
            <ReviewForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
