// 월주(月柱) 계산을 위한 절기(節氣) 근사 경계일 테이블 (MVP 단순화 버전)
// 실제 절기는 태양 황경 기준으로 매년 ±1일 정도 변동하지만,
// 순수 JS 로직 + 외부 천문 API 없이 계산하기 위해 대표(평균) 날짜를 사용한다.
// 절기 경계일 하루 이내로 태어난 경우 실제 결과와 다를 수 있음(앱 내 안내 문구로 고지).

// 각 항목: 절기 이름, 해당 절기부터 시작되는 지지(월지) index(0=자 ... 11=해), { month, day }
export const SOLAR_TERM_BOUNDARIES = [
  { name: '소한', branchIndex: 1, month: 1, day: 6 }, // 축월 시작
  { name: '입춘', branchIndex: 2, month: 2, day: 4 }, // 인월 시작 (연주 기준일이기도 함)
  { name: '경칩', branchIndex: 3, month: 3, day: 6 }, // 묘월 시작
  { name: '청명', branchIndex: 4, month: 4, day: 5 }, // 진월 시작
  { name: '입하', branchIndex: 5, month: 5, day: 6 }, // 사월 시작
  { name: '망종', branchIndex: 6, month: 6, day: 6 }, // 오월 시작
  { name: '소서', branchIndex: 7, month: 7, day: 7 }, // 미월 시작
  { name: '입추', branchIndex: 8, month: 8, day: 8 }, // 신월 시작
  { name: '백로', branchIndex: 9, month: 9, day: 8 }, // 유월 시작
  { name: '한로', branchIndex: 10, month: 10, day: 8 }, // 술월 시작
  { name: '입동', branchIndex: 11, month: 11, day: 7 }, // 해월 시작
  { name: '대설', branchIndex: 0, month: 12, day: 7 }, // 자월 시작
]

export const IPCHUN = { month: 2, day: 4 }
