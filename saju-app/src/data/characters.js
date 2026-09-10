// 10천간(日干) 기준 미소년 캐릭터 프리셋
// stemIndex: 0=갑 1=을 2=병 3=정 4=무 5=기 6=경 7=신 8=임 9=계

export const CHARACTERS = [
  {
    stemIndex: 0,
    stem: '갑',
    stemHanja: '甲',
    element: '목',
    name: '선우진',
    title: '곧게 뻗은 리더형',
    keywords: ['강직함', '리더십', '정직함'],
    avatarSeed: 'gap-01',
    palette: { from: '#bbf7d0', to: '#86efac', accent: '#15803d' },
    description:
      '하늘을 향해 곧게 뻗은 나무처럼, 한번 마음먹은 길은 굽히지 않는 타입. 앞장서서 이끄는 걸 좋아하지만 그만큼 책임감도 크다.',
    loveStyle:
      '직진남. 마음을 정하면 숨기지 않고 표현하며, 상대를 지키고 이끄는 걸 좋아한다.',
    bestMatch: '자신의 뜻을 존중해주고 함께 성장할 수 있는 사람. 화(火)·수(水) 기운과 좋은 시너지를 낸다.',
    quotes: [
      '내가 앞장설게. 넌 그냥 내 손만 잡고 따라오면 돼.',
      '한번 정한 마음은 절대 안 바뀌어. 나는 그런 사람이야.',
    ],
  },
  {
    stemIndex: 1,
    stem: '을',
    stemHanja: '乙',
    element: '목',
    name: '유이든',
    title: '유연한 다정형',
    keywords: ['유연함', '다정함', '눈치 빠름'],
    avatarSeed: 'eul-02',
    palette: { from: '#d9f99d', to: '#bef264', accent: '#4d7c0f' },
    description:
      '바람에 흔들려도 꺾이지 않는 풀꽃처럼, 부드럽지만 은근히 강단 있는 소년. 상대의 기분을 세심하게 살피는 다정한 성격.',
    loveStyle: '곁을 살살 파고드는 스타일. 은근한 스킨십과 세심한 배려로 마음을 얻는다.',
    bestMatch: '감정 기복이 있어도 있는 그대로 받아주는 사람. 토(土) 기운의 안정감과 잘 맞는다.',
    quotes: [
      '괜찮아, 힘든 거 다 알아. 내가 옆에 있잖아.',
      '너한테 맞춰주는 거 아니야, 그냥 너라서 그런 거야.',
    ],
  },
  {
    stemIndex: 2,
    stem: '병',
    stemHanja: '丙',
    element: '화',
    name: '강도윤',
    title: '밝은 태양형',
    keywords: ['밝음', '열정', '사교성'],
    avatarSeed: 'byeong-03',
    palette: { from: '#fed7aa', to: '#fdba74', accent: '#c2410c' },
    description:
      '한낮의 태양처럼 존재만으로 분위기를 환하게 만드는 인기쟁이. 감정 표현에 솔직하고 에너지가 넘친다.',
    loveStyle: '열렬한 대시형. 좋아하면 티가 팍팍 나고, 애정 표현도 아낌없이 한다.',
    bestMatch: '자신의 텐션을 받아줄 밝은 사람, 또는 차분히 중심 잡아주는 수(水) 기운의 상대.',
    quotes: [
      '오늘도 너 때문에 하루종일 웃었잖아. 책임져.',
      '좋아하는 거 숨기는 거, 나랑 안 맞아.',
    ],
  },
  {
    stemIndex: 3,
    stem: '정',
    stemHanja: '丁',
    element: '화',
    name: '하윤성',
    title: '은은한 로맨티스트',
    keywords: ['따뜻함', '섬세함', '은은한 매력'],
    avatarSeed: 'jeong-04',
    palette: { from: '#fecdd3', to: '#fda4af', accent: '#be123c' },
    description:
      '촛불처럼 화려하진 않아도 은은하고 깊은 온기를 지닌 타입. 조용히 곁을 지켜주는 로맨티스트.',
    loveStyle: '은근하고 잔잔한 구애. 작은 것 하나하나 기억해주는 아날로그 감성.',
    bestMatch: '소소한 애정 표현의 가치를 알아주는 사람. 목(木) 기운을 만나면 온기가 더 잘 붙는다.',
    quotes: [
      '특별한 거 안 해도 돼. 그냥 오늘처럼, 옆에 있어줘.',
      '네가 웃는 거 보려고 하루 종일 이 생각만 했어.',
    ],
  },
  {
    stemIndex: 4,
    stem: '무',
    stemHanja: '戊',
    element: '토',
    name: '산하온',
    title: '든든한 버팀목형',
    keywords: ['듬직함', '포용력', '신뢰'],
    avatarSeed: 'mu-05',
    palette: { from: '#fef08a', to: '#fde047', accent: '#a16207' },
    description:
      '큰 산처럼 웬만한 일엔 흔들리지 않고 묵직하게 곁을 지키는 소년. 말은 적어도 행동으로 믿음을 준다.',
    loveStyle: '은근히 츤데레. 표현은 서툴지만 필요한 순간엔 반드시 나타나는 든든한 존재.',
    bestMatch: '감정 기복을 다 받아줘도 흔들리지 않을 안정감을 원하는 사람. 화(火) 기운과 균형이 좋다.',
    quotes: [
      '말은 못해도, 네 옆은 항상 여기야.',
      '무슨 일 있으면 젤 먼저 나한테 와. 그게 내 자리니까.',
    ],
  },
  {
    stemIndex: 5,
    stem: '기',
    stemHanja: '己',
    element: '토',
    name: '온지호',
    title: '다정한 케어형',
    keywords: ['온화함', '배려심', '현실적'],
    avatarSeed: 'gi-06',
    palette: { from: '#fde68a', to: '#fcd34d', accent: '#b45309' },
    description:
      '부드러운 흙처럼 뭐든 품어주고 키워주는 다정한 타입. 상대의 필요를 먼저 챙기는 세심한 케어형.',
    loveStyle: '서포터형 연애. 상대가 잘되길 바라며 묵묵히 뒤에서 챙겨주는 스타일.',
    bestMatch: '챙김을 부담스러워하지 않고 고마움을 표현할 줄 아는 사람.',
    quotes: [
      '밥은 먹었어? 그거부터 챙기고 얘기하자.',
      '너 잘되는 게 곧 내가 잘되는 거야.',
    ],
  },
  {
    stemIndex: 6,
    stem: '경',
    stemHanja: '庚',
    element: '금',
    name: '백강우',
    title: '강인한 의리형',
    keywords: ['강인함', '의리', '결단력'],
    avatarSeed: 'gyeong-07',
    palette: { from: '#e2e8f0', to: '#cbd5e1', accent: '#334155' },
    description:
      '제련된 강철처럼 단단하고 의리 있는 타입. 한번 내 사람이라 생각하면 끝까지 지킨다.',
    loveStyle: '무뚝뚝하지만 진심. 표현은 서투를 수 있지만 행동은 확실하다.',
    bestMatch: '직설적인 화법을 있는 그대로 받아줄 사람. 화(火) 기운이 강철을 벼려주는 좋은 궁합.',
    quotes: [
      '말 예쁘게 못 해서 미안한데, 내 마음은 진심이야.',
      '누가 널 건드리면 그건 나랑 싸우자는 거야.',
    ],
  },
  {
    stemIndex: 7,
    stem: '신',
    stemHanja: '辛',
    element: '금',
    name: '차은결',
    title: '세련된 완벽주의형',
    keywords: ['예리함', '세련됨', '완벽주의'],
    avatarSeed: 'sin-08',
    palette: { from: '#f1f5f9', to: '#e2e8f0', accent: '#475569' },
    description:
      '잘 벼려진 보석처럼 섬세하고 예리한 감각을 지닌 타입. 취향이 확고하고 디테일에 강하다.',
    loveStyle: '밀당의 고수. 감정을 쉽게 들키지 않지만 한번 마음을 열면 누구보다 세심하게 챙긴다.',
    bestMatch: '자신만의 페이스를 존중해주는 사람. 수(水) 기운을 만나면 날카로움이 부드럽게 다듬어진다.',
    quotes: [
      '아무한테나 이렇게 신경 쓰지 않아. 너니까 예외야.',
      '내 눈에 든 이상, 어설픈 건 못 봐줘.',
    ],
  },
  {
    stemIndex: 8,
    stem: '임',
    stemHanja: '壬',
    element: '수',
    name: '남주하',
    title: '자유로운 지혜형',
    keywords: ['지혜로움', '자유로움', '포용력'],
    avatarSeed: 'im-09',
    palette: { from: '#bfdbfe', to: '#93c5fd', accent: '#1d4ed8' },
    description:
      '넓은 바다처럼 스케일이 크고 자유로운 영혼. 어디로 튈지 모르지만 그만큼 다채로운 매력을 지녔다.',
    loveStyle: '쿨한 듯 다정한 스타일. 구속하지 않지만 필요한 순간엔 누구보다 깊게 마음을 준다.',
    bestMatch: '자유를 존중하면서도 함께 있을 땐 온전히 집중해주는 사람. 목(木) 기운과 시너지가 좋다.',
    quotes: [
      '가둬두는 사랑은 안 해. 대신 내가 어디에 있든 넌 항상 1순위야.',
      '넌 내가 유일하게 정착하고 싶은 항구야.',
    ],
  },
  {
    stemIndex: 9,
    stem: '계',
    stemHanja: '癸',
    element: '수',
    name: '서리안',
    title: '섬세한 감성형',
    keywords: ['섬세함', '감성적', '직관력'],
    avatarSeed: 'gye-10',
    palette: { from: '#c7d2fe', to: '#a5b4fc', accent: '#4338ca' },
    description:
      '이슬비처럼 조용히 스며드는 섬세한 감성의 소유자. 눈치가 빠르고 상대의 감정을 잘 읽어낸다.',
    loveStyle: '감정 몰입형. 한번 마음을 주면 깊고 진하게 사랑하며, 작은 신호에도 예민하게 반응한다.',
    bestMatch: '감정 표현을 편안하게 주고받을 수 있는 사람. 금(金) 기운을 만나면 감성이 더 깊어진다.',
    quotes: [
      '말 안 해도 다 알아. 그니까 숨기지 마.',
      '너의 작은 표정 변화까지 다 눈치채고 있어, 나는.',
    ],
  },
]

export function getCharacterByStemIndex(stemIndex) {
  return CHARACTERS.find((c) => c.stemIndex === stemIndex)
}
