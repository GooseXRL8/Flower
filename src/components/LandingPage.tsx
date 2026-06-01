import React from 'react';
import { SafeImage } from './SafeImage';

interface LandingPageProps {
  onEnterLogin: () => void;
  onEnterDemo: () => void;
}

export function LandingPage({ onEnterLogin, onEnterDemo }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#faf6f0] via-[#fffcf7] to-[#fff3f5] relative overflow-hidden flex flex-col justify-between">
      
      {/* Soft overlay floral element */}
      <div className="absolute top-20 left-0 w-72 h-72 rounded-full bg-rose-100/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-purple-100/25 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl mx-auto w-full px-6 py-6 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-2">
          <span className="text-3xl animate-pulse">🌸</span>
          <span className="font-serif font-black text-xl text-gray-850 tracking-tight">FlowerLove</span>
        </div>
        <button
          onClick={onEnterLogin}
          id="btn-landing-signin"
          className="bg-white/80 hover:bg-white text-rose-500 border border-rose-100 hover:border-rose-200 text-xs font-bold py-2.5 px-5 rounded-full shadow-xs transition duration-200 cursor-pointer"
        >
          Acessar Meu Espaço
        </button>
      </header>

      {/* Hero Content */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 flex-1">
        
        {/* Left column text block */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-full text-rose-650 text-xs font-semibold uppercase tracking-wider">
            <span>✨</span> Um espaço seguro e privativo para o casal
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-[#2c151c] leading-tight tracking-tight">
            Celebre sua <br className="hidden md:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500">história de amor</span>
          </h1>

          <p className="text-base md:text-lg text-gray-650 max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Crie um espaço único e inesquecível para guardar suas memórias especiais, colecionar fotos em formato polaroid, acompanhar cada segundo juntos e compartilhar o sentimento em lindos cartões.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <button
              onClick={onEnterLogin}
              id="btn-landing-cta"
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm py-3.5 px-8 rounded-full shadow-md hover:shadow-lg transition duration-250 cursor-pointer transform hover:-translate-y-0.5"
            >
              Criar Nosso Perfil ✨
            </button>

            <button
              onClick={onEnterDemo}
              id="btn-landing-demo"
              className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-950 border border-gray-200 hover:border-gray-300 font-bold text-sm py-3.5 px-8 rounded-full shadow-xs transition duration-200 cursor-pointer transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <span>Ver Exemplo Interativo</span>
              <span>🌸</span>
            </button>
          </div>

          {/* Social Proof trust badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 pt-6 text-[11px] text-gray-400 font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="text-rose-455 text-sm">📅</span> Contador Preciso
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-rose-455 text-sm">🔒</span> Seguro e Privativo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-rose-455 text-sm">💝</span> Formato Polaroids
            </span>
          </div>
        </div>

        {/* Right column: Interactive Visual Showcase */}
        <div className="lg:col-span-5 relative flex justify-center">
          
          {/* Aesthetic Background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-rose-100/50 to-purple-100/50 blur-xl -z-10" />

          {/* Polaroid and cards overlap simulation */}
          <div className="relative w-full max-w-sm space-y-4">
            
            {/* Memory Card mockup */}
            <div className="bg-white/90 backdrop-blur-md border border-white rounded-2xl p-4 shadow-xl transform -rotate-2 hover:-rotate-1 hover:scale-102 transition duration-300 relative z-20">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-sm bg-rose-50 text-rose-500 rounded-full p-1 leading-none">❤️</span>
                <span className="text-[10px] font-mono text-gray-400 uppercase">12 de Junho, 2023</span>
              </div>
              <h3 className="text-sm font-serif font-bold text-gray-850">Nosso Pedido de Namoro</h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                "O sim mais lindo e sincero da minha vida, acompanhado de choro de felicidade..."
              </p>
            </div>

            {/* Vintage Polaroid mockup */}
            <div className="bg-white p-3 pb-6 rounded-xs shadow-2xl border border-gray-150 rotate-3 hover:rotate-2 hover:scale-102 transition duration-300 absolute -top-12 -right-4 w-52 z-10 overflow-hidden">
              <div className="aspect-square bg-gray-100 rounded-xs overflow-hidden mb-2 relative">
                <SafeImage
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80"
                  alt="Casal feliz"
                  className="w-full h-full object-cover"
                  fallbackType="polaroid"
                />
              </div>
              <div className="text-center font-serif text-xs italic font-semibold text-gray-700">
                Pedro & Sofia 🌸
              </div>
            </div>

            {/* Simulated Live Counter */}
            <div className="bg-linear-to-r from-rose-500 to-pink-500 text-white rounded-3xl p-4 shadow-xl transform rotate-1 hover:rotate-0 hover:scale-102 transition duration-300 flex items-center justify-between relative z-30">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase tracking-wider font-bold text-rose-100">Juntos há</span>
                <h4 className="text-xl font-mono font-bold">1.082 dias</h4>
                <p className="text-[9px] text-pink-50 font-medium">Boda de Flores e Frutas 🌸</p>
              </div>
              <span className="text-3xl animate-bounce">👩‍❤️‍👨</span>
            </div>

          </div>

        </div>

      </main>

      {/* Feature Bento Grid */}
      <section className="bg-white/60 border-t border-rose-100/40 py-12 relative z-10 w-full">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl font-serif font-black text-gray-850">O que você e seu par podem fazer?</h2>
            <p className="text-xs text-gray-400">Uma experiência pensada exclusivamente para guardar e compartilhar seu romance</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Benefit item 1 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <span className="text-3xl">🕒</span>
              <h3 className="text-sm font-bold text-gray-805 mt-3 mb-1">Contador em Tempo Real</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Descubra a quantidade exata de anos, meses, dias, minutos e segundos passados ao lado do seu parceiro.
              </p>
            </div>

            {/* Benefit item 2 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <span className="text-3xl">📖</span>
              <h3 className="text-sm font-bold text-gray-850 mt-3 mb-1">Baú de Lembranças</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Guarde cada viagem, jantar romântico, passeio surpresa e piada interna marcando a data, local e fotos do dia.
              </p>
            </div>

            {/* Benefit item 3 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <span className="text-3xl">📸</span>
              <h3 className="text-sm font-bold text-gray-850 mt-3 mb-1">Mural de Polaroids</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Monte uma galeria vintage de registros memoráveis. Adicione suas fotos preferidas organizadas em formato polaroid.
              </p>
            </div>

            {/* Benefit item 4 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <span className="text-3xl">🖨️</span>
              <h3 className="text-sm font-bold text-gray-850 mt-3 mb-1">Cartões de Celebração</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Gere lindos cartões com mensagens de amor e o contador de tempo de vocês para compartilhar ou imprimir.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-[#f4ebdf] text-[11px] text-gray-400 font-medium">
        FlowerLove © {new Date().getFullYear()} • Feito com amor para casais apaixonados
      </footer>

    </div>
  );
}
