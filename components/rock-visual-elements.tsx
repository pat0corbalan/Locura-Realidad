export function FloatingRockIcons() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Logos de bandas flotantes (ajusta los nombres de archivo según tus imágenes en public/) */}
      
      {/* Banda 1 */}
      <div className="absolute top-20 left-10 opacity-10 animate-pulse">
        <img 
          src="/bands/banda1.png" 
          alt="Logo Banda" 
          className="h-28 w-28 object-contain rotate-12" 
        />
      </div>

      {/* Banda 2 */}
      <div className="absolute top-40 right-20 opacity-10 animate-pulse delay-1000">
        <img 
          src="/bands/banda2.png" 
          alt="Logo Banda" 
          className="h-24 w-24 object-contain -rotate-45" 
        />
      </div>

      {/* Banda 3 */}
      <div className="absolute top-60 left-1/4 opacity-10 animate-spin-slow">
        <img 
          src="/bands/banda3.png" 
          alt="Logo Banda" 
          className="h-28 w-28 object-contain" 
        />
      </div>

      {/* Banda 4 */}
      <div className="absolute bottom-40 right-1/3 opacity-10 animate-spin-slow delay-2000">
        <img 
          src="/bands/banda4.png" 
          alt="Logo Banda" 
          className="h-20 w-20 object-contain" 
        />
      </div>

      {/* Banda 5 */}
      <div className="absolute top-32 right-1/4 opacity-10 animate-bounce delay-500">
        <img 
          src="/bands/banda5.png" 
          alt="Logo Banda" 
          className="h-24 w-24 object-contain" 
        />
      </div>

      {/* Banda 6 */}
      <div className="absolute bottom-60 left-1/3 opacity-10 animate-bounce delay-1500">
        <img 
          src="/bands/banda6.png" 
          alt="Logo Banda" 
          className="h-20 w-20 object-contain" 
        />
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

export function SectionDivider() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-4">
        <div className="h-px bg-border flex-1 max-w-20"></div>
        {/* Aquí puedes poner un logo pequeño central si lo deseas */}
        <img src="/logo.png" alt="Divider Logo" className="h-6 w-6 object-contain opacity-70" />
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
            El rock no es solo música, es una forma de vida que nos conecta con personas en cada viaje al rededor del país.
          </blockquote>
          <div className="absolute -bottom-4 -right-4 text-6xl text-primary/20 font-bold">"</div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-6">
          <img src="/logo.png" alt="Logo" className="h-5 w-5 object-contain" />
          <span className="text-muted-foreground">- Locura y Realidad</span>
          <img src="/logo.png" alt="Logo" className="h-5 w-5 object-contain" />
        </div>
      </div>
    </div>
  )
}