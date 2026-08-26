import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KYOBO Thumbnail Maker",
  description: "740 x 400 Newsroom Thumbnail Studio",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
