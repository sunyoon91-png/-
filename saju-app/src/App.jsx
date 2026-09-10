import { useState } from 'react'
import InputForm from './components/InputForm'
import ResultCard from './components/ResultCard'
import { calculateSaju } from './logic/sajuCalculator'
import { getCharacterByStemIndex } from './data/characters'

export default function App() {
  const [result, setResult] = useState(null)

  function handleSubmit(input) {
    const saju = calculateSaju(input)
    const character = getCharacterByStemIndex(saju.dayStemIndex)
    setResult({ saju, character })
  }

  function handleRestart() {
    setResult(null)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10 sm:py-14">
      {result ? (
        <ResultCard saju={result.saju} character={result.character} onRestart={handleRestart} />
      ) : (
        <InputForm onSubmit={handleSubmit} />
      )}
      <p className="mt-6 text-xs text-purple-300">🌙 미소년 사주 · 재미로 보는 콘텐츠입니다 🌙</p>
    </main>
  )
}
