// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ApolloWrapper from "@/lib/ApolloWrapper";

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple todo application",
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