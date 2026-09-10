// 외부 이미지 없이 CSS/SVG로 그리는 심플한 미소년 아바타 placeholder
// 캐릭터별 palette(from/to/accent)로 헤어 컬러와 톤을 다르게 표현한다.

const HAIR_SHAPES = {
  목: 'M20,55 Q15,15 50,10 Q85,15 80,55 Q75,35 50,32 Q25,35 20,55 Z',
  화: 'M15,52 Q10,10 50,8 Q90,10 85,52 Q80,20 50,20 Q35,20 30,35 Q25,25 15,52 Z',
  토: 'M18,58 Q20,18 50,14 Q80,18 82,58 Q78,40 50,38 Q22,40 18,58 Z',
  금: 'M20,50 Q22,12 50,10 Q78,12 80,50 Q76,28 50,26 Q24,28 20,50 Z',
  수: 'M16,54 Q12,14 50,9 Q88,14 84,54 Q82,30 50,30 Q18,30 16,54 Z',
}

export default function CharacterAvatar({ character, size = 160 }) {
  const { palette, element } = character
  const hairPath = HAIR_SHAPES[element] || HAIR_SHAPES['목']
  const gradientId = `grad-${character.avatarSeed}`

  return (
    <div
      className="relative mx-auto rounded-full shadow-inner"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 30%, ${palette.from}, ${palette.to})`,
      }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={palette.to} stopOpacity="0.9" />
          </linearGradient>
        </defs>
        {/* 얼굴 */}
        <ellipse cx="50" cy="58" rx="26" ry="28" fill="#fff7ed" opacity="0.95" />
        {/* 볼터치 */}
        <circle cx="32" cy="64" r="5" fill={palette.accent} opacity="0.35" />
        <circle cx="68" cy="64" r="5" fill={palette.accent} opacity="0.35" />
        {/* 눈 */}
        <circle cx="40" cy="56" r="3" fill="#3b2f45" />
        <circle cx="60" cy="56" r="3" fill="#3b2f45" />
        {/* 입 */}
        <path d="M45,68 Q50,72 55,68" stroke="#3b2f45" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* 헤어 */}
        <path d={hairPath} fill={`url(#${gradientId})`} />
      </svg>
    </div>
  )
}
