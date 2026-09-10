import { useMemo, useState } from 'react'

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 120 }, (_, i) => CURRENT_YEAR - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

const HOUR_OPTIONS = [
  { label: '모름', value: null },
  { label: '23:00 ~ 00:59 (자시)', value: 23 },
  { label: '01:00 ~ 02:59 (축시)', value: 1 },
  { label: '03:00 ~ 04:59 (인시)', value: 3 },
  { label: '05:00 ~ 06:59 (묘시)', value: 5 },
  { label: '07:00 ~ 08:59 (진시)', value: 7 },
  { label: '09:00 ~ 10:59 (사시)', value: 9 },
  { label: '11:00 ~ 12:59 (오시)', value: 11 },
  { label: '13:00 ~ 14:59 (미시)', value: 13 },
  { label: '15:00 ~ 16:59 (신시)', value: 15 },
  { label: '17:00 ~ 18:59 (유시)', value: 17 },
  { label: '19:00 ~ 20:59 (술시)', value: 19 },
  { label: '21:00 ~ 22:59 (해시)', value: 21 },
]

function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

export default function InputForm({ onSubmit }) {
  const [year, setYear] = useState(2000)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [hourValue, setHourValue] = useState('unknown')
  const [gender, setGender] = useState('none')

  const dayOptions = useMemo(() => {
    const count = daysInMonth(year, month)
    return Array.from({ length: count }, (_, i) => i + 1)
  }, [year, month])

  function handleSubmit(e) {
    e.preventDefault()
    const hour = hourValue === 'unknown' ? null : Number(hourValue)
    onSubmit({ year: Number(year), month: Number(month), day: Number(day), hour, gender })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl bg-white/80 backdrop-blur-sm shadow-xl shadow-pink-200/50 ring-1 ring-pink-100 p-6 sm:p-8 space-y-6"
    >
      <div className="text-center space-y-2">
        <p className="text-sm text-purple-400">🌙 미소년 사주 🌙</p>
        <h1 className="font-title text-2xl sm:text-3xl text-purple-900">
          당신의 사주를 대표하는
          <br />
          미소년을 만나보세요
        </h1>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-purple-700">생년월일</label>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-pink-200 bg-pink-50/60 px-2 py-2.5 text-sm text-purple-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-xl border border-pink-200 bg-pink-50/60 px-2 py-2.5 text-sm text-purple-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </select>
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="rounded-xl border border-pink-200 bg-pink-50/60 px-2 py-2.5 text-sm text-purple-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
          >
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d}일
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-purple-300">양력 기준으로 입력해주세요.</p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-purple-700">태어난 시간</label>
        <select
          value={hourValue}
          onChange={(e) => setHourValue(e.target.value)}
          className="w-full rounded-xl border border-pink-200 bg-pink-50/60 px-3 py-2.5 text-sm text-purple-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
        >
          <option value="unknown">모름</option>
          {HOUR_OPTIONS.filter((h) => h.value !== null).map((h) => (
            <option key={h.value} value={h.value}>
              {h.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-purple-700">성별</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'female', label: '여성' },
            { value: 'male', label: '남성' },
            { value: 'none', label: '선택 안 함' },
          ].map((g) => (
            <button
              type="button"
              key={g.value}
              onClick={() => setGender(g.value)}
              className={`rounded-xl px-2 py-2.5 text-sm font-medium border transition ${
                gender === g.value
                  ? 'bg-gradient-to-r from-pink-300 to-purple-300 text-white border-transparent shadow-md'
                  : 'bg-white/70 border-pink-200 text-purple-500 hover:bg-pink-50'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-2xl bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 py-3.5 text-white font-title text-lg tracking-wide shadow-lg shadow-purple-300/50 hover:brightness-105 active:scale-[0.98] transition"
      >
        내 미소년 만나러 가기 ✨
      </button>
    </form>
  )
}
