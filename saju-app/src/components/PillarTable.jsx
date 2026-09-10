import { ELEMENT_INFO } from '../data/ganzhi'

const LABELS = ['년주', '월주', '일주', '시주']

export default function PillarTable({ saju }) {
  const pillars = [saju.yearPillar, saju.monthPillar, saju.dayPillar, saju.hourPillar]

  return (
    <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
      {pillars.map((p, i) => (
        <div
          key={i}
          className="rounded-xl bg-white/70 ring-1 ring-purple-100 p-2 text-center"
        >
          <div className="text-[11px] text-purple-400 mb-1">{LABELS[i]}</div>
          {p ? (
            <>
              <div className="font-title text-lg text-purple-900 leading-tight">{p.name}</div>
              <div className="mt-1 flex justify-center gap-0.5 text-[10px]">
                <span
                  className="rounded-full px-1.5 py-0.5 text-white"
                  style={{ background: ELEMENT_INFO[p.stemElement].color }}
                >
                  {p.stemElement}
                </span>
                <span
                  className="rounded-full px-1.5 py-0.5 text-white"
                  style={{ background: ELEMENT_INFO[p.branchElement].color }}
                >
                  {p.branchElement}
                </span>
              </div>
            </>
          ) : (
            <div className="text-xs text-purple-300 py-2">모름</div>
          )}
        </div>
      ))}
    </div>
  )
}
