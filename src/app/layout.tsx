/**
 * NeuroStream Reader - Root Layout
 *
 * Wraps the app with providers for settings and reader state.
 */

import type { Metadata } from 'next';
import { SettingsProvider } from '@/context/SettingsContext';
import { ReaderProvider } from '@/context/ReaderContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Spreed - Speed Reading with RSVP',
  description: 'A web-based RSVP (Rapid Serial Visual Presentation) speed reading application. Read faster without sacrificing comprehension.',
  keywords: ['speed reading', 'RSVP', 'rapid serial visual presentation', 'reading', 'spreed'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SettingsProvider>
          <ReaderProvider>
            {children}
          </ReaderProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
