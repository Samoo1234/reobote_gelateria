import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import ClientProvider from '@/components/ClientProvider';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Pesquisa de Satisfação - Sorveteria',
  description: 'Formulário de pesquisa de satisfação para clientes da sorveteria',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={poppins.className}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}