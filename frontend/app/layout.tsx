import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TerraSignal AI | Real Estate Early-Warning & Decision Intelligence',
  description: 'Know the property. Predict the risk. Decide with intelligence. Grounded predictive valuation, 8-dimensional risk scoring, and What-If scenario simulation.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}

