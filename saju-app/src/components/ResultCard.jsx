import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import CharacterAvatar from './CharacterAvatar'
import ElementChart from './ElementChart'
import PillarTable from './PillarTable'
import { ELEMENT_INFO } from '../data/ganzhi'

export default function ResultCard({ saju, character, onRestart }) {
  const cardRef = useRef(null)
  const [shareMsg, setShareMsg] = useState('')

  async function handleSaveImage() {
    if (!cardRef.current) return
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#fdf2f8',
        scale: 2,
        useCORS: true,
      })
      const link = document.createElement('a')
      link.download = `미소년사주_${character.name}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setShareMsg('이미지로 저장했어요! 📸')
    } catch {
      setShareMsg('이미지 저장에 실패했어요. 스크린샷으로 저장해주세요!')
    }
    setTimeout(() => setShareMsg(''), 2500)
  }

  async function handleShareLink() {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({
          title: '미소년 사주',
          text: `내 사주를 대표하는 미소년은 "${character.name}"! 너의 결과도 확인해봐 🌙`,
          url,
        })
      } else {
        await navigator.clipboard.writeText(url)
        setShareMsg('링크가 복사됐어요! 📋')
      }
    } catch {
      setShareMsg('공유에 실패했어요.')
    }
    setTimeout(() => setShareMsg(''), 2500)
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div
        ref={cardRef}
        className="rounded-3xl bg-gradient-to-b from-white/90 to-pink-50/90 backdrop-blur-sm shadow-xl shadow-purple-200/50 ring-1 ring-pink-100 p-6 sm:p-8 space-y-5"
      >
        <div className="text-center space-y-1">
          <p className="text-xs text-purple-400">🌙 미소년 사주 결과 🌙</p>
          <p className="text-sm text-purple-500">
            나의 일간(日干)은{' '}
            <span className="font-bold" style={{ color: ELEMENT_INFO[character.element].color }}>
              {character.stem}({character.stemHanja}) · {character.element}
            </span>
          </p>
        </div>

        <CharacterAvatar character={character} size={150} />

        <div className="text-center space-y-1">
          <h2 className="font-title text-2xl text-purple-900">{character.name}</h2>
          <p className="text-sm font-semibold text-fuchsia-500">{character.title}</p>
          <div className="flex justify-center flex-wrap gap-1.5 pt-1">
            {character.keywords.map((k) => (
              <span
                key={k}
                className="rounded-full bg-purple-100 text-purple-600 text-xs px-3 py-1"
              >
                #{k}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm text-center leading-relaxed text-purple-700 px-1">
          {character.description}
        </p>

        <div className="rounded-2xl bg-white/70 ring-1 ring-pink-100 p-4 space-y-3">
          {character.quotes.map((q, i) => (
            <p key={i} className="text-sm italic text-purple-800 leading-relaxed">
              “{q}”
            </p>
          ))}
        </div>

        <div className="space-y-2 text-sm">
          <div className="rounded-xl bg-pink-50/80 p-3">
            <p className="font-semibold text-pink-500 mb-1">💗 연애 스타일</p>
            <p className="text-purple-700 leading-relaxed">{character.loveStyle}</p>
          </div>
          <div className="rounded-xl bg-indigo-50/80 p-3">
            <p className="font-semibold text-indigo-500 mb-1">💫 잘 맞는 상대</p>
            <p className="text-purple-700 leading-relaxed">{character.bestMatch}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-purple-400 mb-2 text-center">사주팔자</p>
          <PillarTable saju={saju} />
          {!saju.hasHour && (
            <p className="text-[11px] text-purple-300 text-center mt-1">
              태어난 시간을 몰라 시주는 제외하고 계산했어요.
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-purple-400 mb-2 text-center">오행 분포</p>
          <ElementChart elementRatio={saju.elementRatio} />
        </div>

        <p className="text-[10px] text-center text-purple-300 leading-relaxed pt-1">
          ✨ 재미로 보는 콘텐츠이며, 절기 경계일 근처 출생자는 결과가 실제 만세력과
          다를 수 있어요.
        </p>
      </div>

      {shareMsg && (
        <p className="text-center text-sm text-fuchsia-500 font-medium">{shareMsg}</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleSaveImage}
          className="rounded-2xl bg-white/80 ring-1 ring-purple-200 text-purple-600 font-semibold py-3 text-sm hover:bg-purple-50 transition"
        >
          📸 이미지 저장
        </button>
        <button
          onClick={handleShareLink}
          className="rounded-2xl bg-white/80 ring-1 ring-purple-200 text-purple-600 font-semibold py-3 text-sm hover:bg-purple-50 transition"
        >
          🔗 링크 공유
        </button>
      </div>
      <button
        onClick={onRestart}
        className="w-full rounded-2xl bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 py-3 text-white font-title tracking-wide shadow-lg shadow-purple-300/40 hover:brightness-105 active:scale-[0.98] transition"
      >
        다시 계산하기
      </button>
    </div>
  )
}
