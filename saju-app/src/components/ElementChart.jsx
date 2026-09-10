import { ELEMENTS, ELEMENT_INFO } from '../data/ganzhi'

const SIZE = 220
const CENTER = SIZE / 2
const MAX_R = 80

function polarPoint(angle, r) {
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  }
}

export default function ElementChart({ elementRatio }) {
  const axisCount = ELEMENTS.length
  const angleStep = (Math.PI * 2) / axisCount
  const startAngle = -Math.PI / 2

  const maxValue = Math.max(...ELEMENTS.map((el) => elementRatio[el]), 1)
  const scale = (v) => (v / Math.max(maxValue, 50)) * MAX_R

  const points = ELEMENTS.map((el, i) => {
    const angle = startAngle + i * angleStep
    const r = scale(elementRatio[el])
    return polarPoint(angle, r)
  })
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ')

  const rings = [0.25, 0.5, 0.75, 1]

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-[240px]">
        {rings.map((r) => (
          <polygon
            key={r}
            points={ELEMENTS.map((_, i) => {
              const angle = startAngle + i * angleStep
              const p = polarPoint(angle, MAX_R * r)
              return `${p.x},${p.y}`
            }).join(' ')}
            fill="none"
            stroke="#f3e8ff"
            strokeWidth="1"
          />
        ))}
        {ELEMENTS.map((_, i) => {
          const angle = startAngle + i * angleStep
          const p = polarPoint(angle, MAX_R)
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="#f3e8ff"
              strokeWidth="1"
            />
          )
        })}
        <polygon
          points={polygonPoints}
          fill="rgba(217,70,239,0.25)"
          stroke="#c026d3"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#a21caf" />
        ))}
        {ELEMENTS.map((el, i) => {
          const angle = startAngle + i * angleStep
          const p = polarPoint(angle, MAX_R + 22)
          return (
            <text
              key={el}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="700"
              fill={ELEMENT_INFO[el].color}
            >
              {el}
            </text>
          )
        })}
      </svg>
      <div className="grid grid-cols-5 gap-1 w-full max-w-[280px] text-center">
        {ELEMENTS.map((el) => (
          <div key={el} className="text-xs">
            <div
              className="mx-auto mb-1 h-2 w-2 rounded-full"
              style={{ background: ELEMENT_INFO[el].color }}
            />
            <div className="font-semibold text-purple-800">{elementRatio[el]}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}
