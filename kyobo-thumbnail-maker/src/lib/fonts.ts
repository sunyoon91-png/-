/**
 * Canvas text does not trigger @font-face loading on its own, so we force it
 * here and resolve once the weights we draw with are ready (or fall back
 * silently to Arial/sans-serif if Pretendard can't be loaded).
 */
export async function ensurePretendardLoaded(): Promise<void> {
  if (typeof document === "undefined" || !("fonts" in document)) return;
  try {
    await Promise.all([
      document.fonts.load("900 46px Pretendard"),
      document.fonts.load("700 46px Pretendard"),
      document.fonts.load("600 20px Pretendard"),
    ]);
  } catch {
    // Fallback fonts (Arial/sans-serif) will be used instead.
  }
}
