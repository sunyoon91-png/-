// 외부 이미지 없이 SVG로 그리는 '사극 미소년' 스타일 아바타 placeholder.
// 망건(이마 밴드)·상투·저고리 깃 등 한복 요소를 단순화해 '사주를 봐주는 미소년' 톤을 표현한다.
// 오행(element)별로 옆머리 실루엣과 컬러를 다르게 해 캐릭터를 구분한다.

const SIDE_HAIR = {
  // 옆머리 실루엣 (귀 옆 ~ 어깨 방향), 오행별로 길이/곡선이 다름
  목: 'M27,40 Q20,58 24,78 Q26,86 33,90 L33,60 Q29,50 30,40 Z M73,40 Q80,58 76,78 Q74,86 67,90 L67,60 Q71,50 70,40 Z',
  화: 'M26,38 Q16,54 22,74 Q25,84 34,88 L34,58 Q28,48 29,38 Z M74,38 Q84,54 78,74 Q75,84 66,88 L66,58 Q72,48 71,38 Z',
  토: 'M28,42 Q23,56 26,70 Q27,76 32,80 L32,58 Q29,50 30,42 Z M72,42 Q77,56 74,70 Q73,76 68,80 L68,58 Q71,50 70,42 Z',
  금: 'M28,40 Q24,52 27,64 Q28,68 31,70 L31,56 Q29,48 30,40 Z M72,40 Q76,52 73,64 Q72,68 69,70 L69,56 Q71,48 70,40 Z',
  수: 'M26,40 Q17,60 21,82 Q23,92 32,96 L32,60 Q28,50 29,40 Z M74,40 Q83,60 79,82 Q77,92 68,96 L68,60 Q72,50 71,40 Z',
}

export default function CharacterAvatar({ character, size = 160 }) {
  const { palette } = character
  const hairSide = SIDE_HAIR[character.element] || SIDE_HAIR['목']
  const hairGradId = `hair-${character.avatarSeed}`
  const bandGradId = `band-${character.avatarSeed}`

  return (
    <div
      className="relative mx-auto"
      style={{
        width: size,
        height: size * 1.15,
        background: `radial-gradient(circle at 50% 30%, ${palette.from}55, transparent 70%)`,
      }}
    >
      <svg viewBox="0 0 100 130" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={hairGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2b2438" />
            <stop offset="100%" stopColor="#1a1522" />
          </linearGradient>
          <linearGradient id={bandGradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={palette.accent} />
            <stop offset="100%" stopColor={palette.to} />
          </linearGradient>
        </defs>

        {/* 저고리 깃 (한복 옷깃) */}
        <path
          d="M14,130 L34,96 L50,110 L66,96 L86,130 Z"
          fill={palette.to}
          opacity="0.9"
        />
        <path d="M50,110 L34,96 L38,94 L50,104 L62,94 L66,96 Z" fill="#fffaf3" />
        <path
          d="M14,130 L34,96 L38,98 L20,130 Z M86,130 L66,96 L62,98 L80,130 Z"
          fill={palette.accent}
          opacity="0.55"
        />

        {/* 목 */}
        <rect x="44" y="82" width="12" height="18" rx="4" fill="#ffe9d6" />

        {/* 뒷머리(옆머리) 실루엣 */}
        <path d={hairSide} fill={`url(#${hairGradId})`} />

        {/* 얼굴 */}
        <path
          d="M50,26 C64,26 71,38 70,54 C69,70 60,84 50,84 C40,84 31,70 30,54 C29,38 36,26 50,26 Z"
          fill="#ffefdd"
        />

        {/* 볼터치 */}
        <ellipse cx="36" cy="62" rx="4.5" ry="3" fill={palette.accent} opacity="0.28" />
        <ellipse cx="64" cy="62" rx="4.5" ry="3" fill={palette.accent} opacity="0.28" />

        {/* 눈썹 */}
        <path d="M38,50 Q43,46.5 48,49" stroke="#2b2438" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M52,49 Q57,46.5 62,50" stroke="#2b2438" strokeWidth="1.6" fill="none" strokeLinecap="round" />

        {/* 눈 */}
        <path d="M39,55 Q43,52.5 47,55" stroke="#2b2438" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M53,55 Q57,52.5 61,55" stroke="#2b2438" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* 코 */}
        <path d="M50,58 L48,66 Q50,68 52,66" stroke="#e8b892" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* 입 */}
        <path d="M44,72 Q50,76 56,72" stroke="#c2685f" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {/* 앞머리 (밴드 위로 살짝) */}
        <path
          d="M31,38 Q50,22 69,38 Q68,30 50,27 Q32,30 31,38 Z"
          fill={`url(#${hairGradId})`}
        />

        {/* 망건(이마 밴드) */}
        <rect x="29" y="35" width="42" height="6" rx="3" fill={`url(#${bandGradId})`} />
        <circle cx="71" cy="38" r="2.4" fill="#fffaf3" />

        {/* 상투 (정수리 상투머리) */}
        <circle cx="50" cy="20" r="6" fill={`url(#${hairGradId})`} />
        <rect x="47" y="14" width="6" height="5" rx="2" fill={palette.accent} />
      </svg>
    </div>
  )
}
