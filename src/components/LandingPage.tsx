import React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { SafeImage } from './SafeImage';
import { normalizeImageUrl } from '../utils/supabase';

// Caminhos das imagens decorativas do Hero.
// Usamos a função normalizeImageUrl para garantir que links do Google Drive, Dropbox, Pinterest etc. convertam em imagens renderizáveis diretas!
const HERO_BACKGROUND_SCENE = 'https://drive.google.com/file/d/1na7gxGGSa6zaELkzxwtj6DHf_h1tbBHK/view?usp=sharing'; // Paisagem ao fundo do Hero (colinas e árvore)
const HERO_COUPLE_FLOWERS = 'https://drive.google.com/file/d/1cgm3bgoWFMTkfG2WZQ0l4pNVUJymjCP7/view?usp=sharing';    // Casal caminhando no gramado florido (silhueta)

interface LandingPageProps {
  onEnterLogin: () => void;
  onEnterDemo: () => void;
}

export function LandingPage({ onEnterLogin, onEnterDemo }: LandingPageProps) {
  const { scrollY } = useScroll();

  // Efeito parallax fluido e sutil para o background cenográfico (Layer 1)
  const yBg = useTransform(scrollY, [0, 800], [0, 90]);
  const scaleBg = useTransform(scrollY, [0, 800], [1, 1.06]);

  // Efeito dinâmico de movimento e profundidade ao scrollar para o casal (Layer 2)
  // O casal caminha ligeiramente para frente, para a esquerda e amplia de forma tridimensional no scroll
  const yCouple = useTransform(scrollY, [0, 750], [0, -75]);
  const xCouple = useTransform(scrollY, [0, 750], [0, -50]);
  const scaleCouple = useTransform(scrollY, [0, 750], [1, 1.10]);
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
        
        {/* Layer 1: Scenic Background Landscape (Dreamy Cherry Blossom & Hills) */}
        <motion.div 
          className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden opacity-30 lg:opacity-50 z-0"
          style={{ y: yBg, scale: scaleBg }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <img
            src={normalizeImageUrl(HERO_BACKGROUND_SCENE)}
            alt="Paisagem romântica de fundo"
            className="w-full h-full object-cover object-center blur-[0.5px]"
            referrerPolicy="no-referrer"
            onError={(e) => {
              // Hide gracefully if image load fails
              (e.target as HTMLElement).parentElement!.style.display = 'none';
            }}
          />
          {/* Soft masking gradients to blend image seamlessly with the landing page background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#faf6f0] via-[#faf6f0]/75 to-transparent block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fffcf7] via-transparent to-[#faf6f0]/25" />
        </motion.div>

        {/* Layer 2: 3D Walking Couple Foreground (With dynamic scroll parallax and gentle breathing loop) */}
        <motion.div 
          className="absolute inset-0 w-full h-full pointer-events-none select-none overflow-hidden z-5 mix-blend-multiply opacity-55 sm:opacity-75 lg:opacity-95"
          style={{ 
            y: yCouple,
            x: xCouple,
            scale: scaleCouple
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
        >
          {/* Organic breathing loop separate from scroll parallax for high performance */}
          <motion.div
            className="w-full h-full"
            animate={{ 
              y: [0, -5, 0],
              x: [0, 1.5, 0]
            }}
            transition={{ 
              duration: 9, 
              repeat: Infinity, 
              ease: 'easeInOut' 
              }}
            >
              <img
                src={normalizeImageUrl(HERO_COUPLE_FLOWERS)}
                alt="Casal caminhando no jardim de flores"
                className="w-full h-full object-cover object-center filter drop-shadow-[0_12px_24px_rgba(244,63,94,0.05)]"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fail gracefully if image is missing
                  (e.target as HTMLElement).parentElement!.parentElement!.style.display = 'none';
                }}
              />
            </motion.div>
          </motion.div>

        {/* Left column text block */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left relative z-10">
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
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 pt-6 text-[11px] font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-white bg-black/15 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
              <span className="text-sm">📅</span> Contador Preciso
            </span>
            <span className="flex items-center gap-1.5 text-white bg-black/15 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
              <span className="text-sm">🔒</span> Seguro e Privativo
            </span>
            <span className="flex items-center gap-1.5 text-white bg-black/15 px-3 py-1.5 rounded-full backdrop-blur-xs border border-white/10">
              <span className="text-sm">💝</span> Formato Polaroids
            </span>
          </div>
        </div>

        {/* Right column: Interactive Visual Showcase */}
        <div className="lg:col-span-5 relative flex justify-center min-h-[350px] lg:min-h-[450px]">
          
          {/* Aesthetic Background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-tr from-rose-100/50 to-purple-100/50 blur-xl -z-10" />

          {/* Polaroid and cards overlap simulation */}
          <div className="relative w-full max-w-sm space-y-4 z-10">
            
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
            <div className="bg-[#ffd8f5] p-5 rounded-2xl border border-rose-200/50 shadow-sm hover:shadow-md transition">
              <span className="text-3xl">🕒</span>
              <h3 className="text-sm font-bold text-gray-900 mt-3 mb-1">Contador em Tempo Real</h3>
              <p className="text-xs text-gray-800 leading-relaxed">
                Descubra a quantidade exata de anos, meses, dias, minutos e segundos passados ao lado do seu parceiro.
              </p>
            </div>

            {/* Benefit item 2 */}
            <div className="bg-[#ffd8f5] p-5 rounded-2xl border border-rose-200/50 shadow-sm hover:shadow-md transition">
              <span className="text-3xl">📖</span>
              <h3 className="text-sm font-bold text-gray-900 mt-3 mb-1">Baú de Lembranças</h3>
              <p className="text-xs text-gray-800 leading-relaxed">
                Guarde cada viagem, jantar romântico, passeio surpresa e piada interna marcando a data, local e fotos do dia.
              </p>
            </div>

            {/* Benefit item 3 */}
            <div className="bg-[#ffd8f5] p-5 rounded-2xl border border-rose-200/50 shadow-sm hover:shadow-md transition">
              <span className="text-3xl">📸</span>
              <h3 className="text-sm font-bold text-gray-900 mt-3 mb-1">Mural de Polaroids</h3>
              <p className="text-xs text-gray-800 leading-relaxed">
                Monte uma galeria vintage de registros memoráveis. Adicione suas fotos preferidas organizadas em formato polaroid.
              </p>
            </div>

            {/* Benefit item 4 */}
            <div className="bg-[#ffd8f5] p-5 rounded-2xl border border-rose-200/50 shadow-sm hover:shadow-md transition">
              <span className="text-3xl">🖨️</span>
              <h3 className="text-sm font-bold text-gray-900 mt-3 mb-1">Cartões de Celebração</h3>
              <p className="text-xs text-gray-800 leading-relaxed">
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
