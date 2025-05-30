import type { Metadata } from 'next';
import ApolloWrapper from '@/lib/ApolloWrapper';
import './globals.css';

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'A simple todo application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}