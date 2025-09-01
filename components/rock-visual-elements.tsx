import { Guitar, Music, Disc3, Volume2, Zap, Star } from "lucide-react"

export function FloatingRockIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating guitars */}
      <div className="absolute top-20 left-10 opacity-5 animate-pulse">
        <Guitar className="h-32 w-32 text-primary rotate-12" />
      </div>
      <div className="absolute top-40 right-20 opacity-5 animate-pulse delay-1000">
        <Guitar className="h-24 w-24 text-primary -rotate-45" />
      </div>

      {/* Floating vinyl records */}
      <div className="absolute top-60 left-1/4 opacity-5 animate-spin-slow">
        <Disc3 className="h-28 w-28 text-secondary" />
      </div>
      <div className="absolute bottom-40 right-1/3 opacity-5 animate-spin-slow delay-2000">
        <Disc3 className="h-20 w-20 text-secondary" />
      </div>

      {/* Music notes */}
      <div className="absolute top-32 right-1/4 opacity-5 animate-bounce delay-500">
        <Music className="h-16 w-16 text-primary" />
      </div>
      <div className="absolute bottom-60 left-1/3 opacity-5 animate-bounce delay-1500">
        <Music className="h-12 w-12 text-primary" />
      </div>

      {/* Volume/amp icons */}
      <div className="absolute top-80 right-10 opacity-5 animate-pulse delay-700">
        <Volume2 className="h-20 w-20 text-secondary" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-5 animate-pulse delay-300">
        <Volume2 className="h-16 w-16 text-secondary" />
      </div>

      {/* Lightning bolts for energy */}
      <div className="absolute top-96 left-1/2 opacity-5 animate-pulse delay-1200">
        <Zap className="h-18 w-18 text-primary rotate-12" />
      </div>

      {/* Stars for rock star effect */}
      <div className="absolute top-24 left-1/3 opacity-5 animate-twinkle">
        <Star className="h-8 w-8 text-secondary fill-secondary" />
      </div>
      <div className="absolute bottom-32 right-1/4 opacity-5 animate-twinkle delay-800">
        <Star className="h-6 w-6 text-secondary fill-secondary" />
      </div>
    </div>
  )
}

export function RockPatternBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(220, 38, 38, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(220, 38, 38, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Diagonal lines for texture */}
      <div
        className="absolute inset-0 opacity-[0.01]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            rgba(220, 38, 38, 0.1),
            rgba(220, 38, 38, 0.1) 2px,
            transparent 2px,
            transparent 20px
          )`,
        }}
      />
    </div>
  )
}

export function SectionDivider({ variant = "guitar" }: { variant?: "guitar" | "vinyl" | "lightning" }) {
  const Icon = variant === "guitar" ? Guitar : variant === "vinyl" ? Disc3 : Zap

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-4">
        <div className="h-px bg-border flex-1 max-w-20"></div>
        <Icon className="h-6 w-6 text-primary" />
        <div className="h-px bg-border flex-1 max-w-20"></div>
      </div>
    </div>
  )
}

export function RockQuote() {
  return (
    <div className="relative py-16 px-4 text-center">
      <div className="container mx-auto max-w-4xl">
        <div className="relative">
          <div className="absolute -top-4 -left-4 text-6xl text-primary/20 font-bold">"</div>
          <blockquote className="text-2xl md:text-3xl font-bold text-foreground italic mb-4">
            El rock no es solo música, es una forma de vida que conecta almas rebeldes alrededor del mundo
          </blockquote>
          <div className="absolute -bottom-4 -right-4 text-6xl text-primary/20 font-bold">"</div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-6">
          <Guitar className="h-5 w-5 text-primary" />
          <span className="text-muted-foreground">- Locura y Realidad</span>
          <Guitar className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  )
}
