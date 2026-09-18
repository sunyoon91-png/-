import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "뉴스룸 성과분석",
  description: "교보생명 뉴스룸 콘텐츠 성과 분석 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-background text-ink text-[14px] antialiased">{children}</body>
    </html>
  );
}
