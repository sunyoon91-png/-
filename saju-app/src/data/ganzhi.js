// 60갑자 및 오행 기초 데이터 (외부 API 없이 순수 데이터/로직으로 계산)

export const STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
export const STEMS_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

export const BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
export const BRANCHES_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

export const BRANCH_ANIMALS = ['쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양', '원숭이', '닭', '개', '돼지']

// 천간 오행: 갑을=목, 병정=화, 무기=토, 경신=금, 임계=수
export const STEM_ELEMENT = ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수']

// 지지 오행 (지장간 세분화 없이 대표 오행으로 단순화한 MVP 버전)
export const BRANCH_ELEMENT = ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수']

export const ELEMENTS = ['목', '화', '토', '금', '수']

export const ELEMENT_INFO = {
  목: { hanja: '木', color: '#4ade80', desc: '성장과 시작의 기운' },
  화: { hanja: '火', color: '#fb7185', desc: '열정과 표현의 기운' },
  토: { hanja: '土', color: '#eab308', desc: '중심과 신뢰의 기운' },
  금: { hanja: '金', color: '#94a3b8', desc: '결단과 정제의 기운' },
  수: { hanja: '水', color: '#60a5fa', desc: '지혜와 유연함의 기운' },
}

export const STEM_YINYANG = [
  '양', '음', '양', '음', '양', '음', '양', '음', '양', '음',
]

export function ganzhiName(stemIndex, branchIndex) {
  return `${STEMS[stemIndex]}${BRANCHES[branchIndex]}`
}

export function mod(n, m) {
  return ((n % m) + m) % m
}
