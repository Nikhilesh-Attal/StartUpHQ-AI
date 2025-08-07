// app/(public)/layout.tsx
import type { ReactNode } from 'react';
import '../globals.css'; // Make sure your globals are imported once here
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'StartupHQ AI',
  description: 'Empowering AI tools for startups',
};

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
      <div className="font-body antialiased flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
  );
}
