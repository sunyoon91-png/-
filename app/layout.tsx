import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Newsroom AI Studio",
  description: "뉴스룸 콘텐츠 제작을 빠르게 정리하는 개인용 AI 작업 도구",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
