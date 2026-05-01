import type {Metadata} from 'next';
import { Quicksand } from 'next/font/google';
import './globals.css'; // Global styles

const quicksand = Quicksand({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Mochil - Chatbot de Educación Física',
  description: 'Un chatbot interactivo para Educación Física en Cantabria.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es" className={`${quicksand.variable} font-sans`}>
      <body suppressHydrationWarning className="bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 text-white antialiased min-h-screen flex flex-col overflow-hidden relative">
        {/* Decorative Floating Background Shapes */}
        <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none"></div>
        {children}
      </body>
    </html>
  );
}
