import {
  STEMS,
  BRANCHES,
  STEM_ELEMENT,
  BRANCH_ELEMENT,
  BRANCH_ANIMALS,
  ELEMENTS,
  mod,
  ganzhiName,
} from '../data/ganzhi'
import { SOLAR_TERM_BOUNDARIES, IPCHUN } from '../data/solarTerms'

// 일주(日柱) 계산 기준일: 1900-01-31 = 갑진일(甲辰日)
// (60갑자 index 40 = 갑(0) + 진(4))  → 다수의 만세력 계산 로직에서 공통으로 쓰이는 기준일
const DAY_PILLAR_EPOCH_UTC = Date.UTC(1900, 0, 31)
const DAY_PILLAR_EPOCH_INDEX = 40
const MS_PER_DAY = 24 * 60 * 60 * 1000

function toUtcMidnight(year, month, day) {
  return Date.UTC(year, month - 1, day)
}

/**
 * 일주(日柱) 계산: 기준일로부터의 날짜 차이를 60으로 나눈 나머지
 */
function getDayPillarIndex(year, month, day) {
  const target = toUtcMidnight(year, month, day)
  const diffDays = Math.round((target - DAY_PILLAR_EPOCH_UTC) / MS_PER_DAY)
  return mod(diffDays + DAY_PILLAR_EPOCH_INDEX, 60)
}

/**
 * 절기 기준으로 월지(月支) index를 결정한다.
 * 입춘(대략 2/4) 이전 출생자는 전년도 축월(丑月) 이하로 처리한다.
 */
function getMonthBranchIndex(year, month, day) {
  // 소한(1/6) ~ 입춘(2/4) 이전 구간은 전년도 12월(자월) 이후로 취급되는 축월
  for (let i = SOLAR_TERM_BOUNDARIES.length - 1; i >= 0; i--) {
    const b = SOLAR_TERM_BOUNDARIES[i]
    const boundaryThisYear = toUtcMidnight(year, b.month, b.day)
    if (toUtcMidnight(year, month, day) >= boundaryThisYear) {
      return b.branchIndex
    }
  }
  // 1/1 ~ 소한 이전: 전년도 대설(大雪) 구간, 즉 자월(子月)
  return 0
}

/**
 * 연주(年柱) 계산: 입춘을 기준으로 '사주상의 해'를 결정한다.
 */
function getSajuYear(year, month, day) {
  const ipchunThisYear = toUtcMidnight(year, IPCHUN.month, IPCHUN.day)
  const birth = toUtcMidnight(year, month, day)
  return birth < ipchunThisYear ? year - 1 : year
}

function getYearPillarIndexes(sajuYear) {
  const stemIndex = mod(sajuYear - 4, 10)
  const branchIndex = mod(sajuYear - 4, 12)
  return { stemIndex, branchIndex }
}

/**
 * 월간(月干) 계산: 오호둔(五虎遁) 공식
 * monthStemStart = (연간 index % 5) * 2 + 2 (mod 10) → 인월(寅月) 월간
 */
function getMonthStemIndex(yearStemIndex, monthBranchIndex) {
  const monthStemStart = mod((yearStemIndex % 5) * 2 + 2, 10)
  // 인(2)월을 0으로 하는 순서
  const orderFromIn = mod(monthBranchIndex - 2, 12)
  return mod(monthStemStart + orderFromIn, 10)
}

/**
 * 시지(時支) 계산: 30분 단위 반올림 없이 2시간 단위 구간으로 매핑
 * 23:00~00:59=자, 01:00~02:59=축, ... 21:00~22:59=해
 */
function getHourBranchIndex(hour) {
  if (hour === 23) return 0
  return Math.floor((hour + 1) / 2) % 12
}

/**
 * 시간(時干) 계산: 오서둔(五鼠遁) 공식
 * hourStemStart = (일간 index % 5) * 2 (mod 10) → 자시(子時) 시간
 */
function getHourStemIndex(dayStemIndex, hourBranchIndex) {
  const hourStemStart = mod((dayStemIndex % 5) * 2, 10)
  return mod(hourStemStart + hourBranchIndex, 10)
}

function buildPillar(stemIndex, branchIndex) {
  return {
    stemIndex,
    branchIndex,
    stem: STEMS[stemIndex],
    branch: BRANCHES[branchIndex],
    name: ganzhiName(stemIndex, branchIndex),
    animal: BRANCH_ANIMALS[branchIndex],
    stemElement: STEM_ELEMENT[stemIndex],
    branchElement: BRANCH_ELEMENT[branchIndex],
  }
}

/**
 * 사주팔자 전체 계산
 * @param {Object} input
 * @param {number} input.year
 * @param {number} input.month
 * @param {number} input.day
 * @param {number|null} input.hour - 0~23, 시간을 모르면 null
 */
export function calculateSaju({ year, month, day, hour }) {
  const sajuYear = getSajuYear(year, month, day)
  const { stemIndex: yearStemIndex, branchIndex: yearBranchIndex } =
    getYearPillarIndexes(sajuYear)

  const monthBranchIndex = getMonthBranchIndex(year, month, day)
  const monthStemIndex = getMonthStemIndex(yearStemIndex, monthBranchIndex)

  const dayPillarIndex = getDayPillarIndex(year, month, day)
  const dayStemIndex = mod(dayPillarIndex, 10)
  const dayBranchIndex = mod(dayPillarIndex, 12)

  const yearPillar = buildPillar(yearStemIndex, yearBranchIndex)
  const monthPillar = buildPillar(monthStemIndex, monthBranchIndex)
  const dayPillar = buildPillar(dayStemIndex, dayBranchIndex)

  let hourPillar = null
  if (hour !== null && hour !== undefined) {
    const hourBranchIndex = getHourBranchIndex(hour)
    const hourStemIndex = getHourStemIndex(dayStemIndex, hourBranchIndex)
    hourPillar = buildPillar(hourStemIndex, hourBranchIndex)
  }

  const pillars = [yearPillar, monthPillar, dayPillar, hourPillar].filter(Boolean)

  const elementCounts = ELEMENTS.reduce((acc, el) => ({ ...acc, [el]: 0 }), {})
  pillars.forEach((p) => {
    elementCounts[p.stemElement] += 1
    elementCounts[p.branchElement] += 1
  })
  const totalCount = pillars.length * 2
  const elementRatio = ELEMENTS.reduce((acc, el) => {
    acc[el] = totalCount ? Math.round((elementCounts[el] / totalCount) * 1000) / 10 : 0
    return acc
  }, {})

  return {
    sajuYear,
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    hasHour: hourPillar !== null,
    dayStemIndex,
    dayMasterElement: STEM_ELEMENT[dayStemIndex],
    elementCounts,
    elementRatio,
  }
}
