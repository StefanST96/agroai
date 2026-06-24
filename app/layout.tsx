import type { Metadata } from "next";
// @ts-ignore - allow side-effect CSS import without type declarations
import "./styles.css";

export const metadata: Metadata = {
  title: "AgroAI",
  description: "Zajednica, pijacne cene i subvencije za poljoprivrednike.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
