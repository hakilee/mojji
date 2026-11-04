import type { EmojiOption } from "./emoji-catalog";

const moods = [
  {
    value: "happy",
    label: "기쁨 · 웃음",
    keywords: "happy smile laugh joy 신남 행복 웃는",
    faces: [
      ["(＾▽＾)", "활짝"],
      ["ヽ(・∀・)ﾉ", "신난다"],
      ["(≧▽≦)", "너무 좋아"],
      ["٩(◕‿◕｡)۶", "야호"],
      ["(*´▽`*)", "방긋"],
      ["(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧", "반짝반짝"],
    ],
  },
  {
    value: "love",
    label: "사랑 · 응원",
    keywords: "love heart hug cheer 사랑해 하트 포옹 응원",
    faces: [
      ["(♡°▽°♡)", "반했어"],
      ["(づ｡◕‿‿◕｡)づ", "안아 줘"],
      ["(っ˘з(˘⌣˘ )", "뽀뽀"],
      ["(灬♥ω♥灬)", "하트 눈"],
      ["٩(๑❛ᴗ❛๑)۶", "힘내"],
      ["(๑˃̵ᴗ˂̵)و", "파이팅"],
    ],
  },
  {
    value: "sad",
    label: "슬픔 · 울음",
    keywords: "sad cry tears sorry 슬픈 눈물 미안",
    faces: [
      ["(╥﹏╥)", "엉엉"],
      ["(T_T)", "눈물이 나"],
      ["(｡•́︿•̀｡)", "시무룩"],
      ["(ノ_<。)", "훌쩍"],
      ["(´；ω；`)", "울먹울먹"],
      ["(っ˘̩╭╮˘̩)っ", "위로해 줘"],
    ],
  },
  {
    value: "angry",
    label: "화남 · 불만",
    keywords: "angry rage mad 화난 짜증 분노",
    faces: [
      ["(╬ಠ益ಠ)", "분노"],
      ["(＃`Д´)", "버럭"],
      ["(¬_¬)", "못마땅"],
      ["(눈_눈)", "지켜본다"],
      ["(╯°□°)╯︵ ┻━┻", "밥상 뒤집기", "table flip"],
      ["┬─┬ノ( º _ ºノ)", "밥상 되돌리기", "table unflip"],
    ],
  },
  {
    value: "surprised",
    label: "놀람 · 당황",
    keywords: "surprised shock confused shrug 놀란 당황 몰라",
    faces: [
      ["Σ(°△°|||)", "깜짝"],
      ["(⊙_⊙)", "동그란 눈"],
      ["(°ロ°) !", "헉"],
      ["(・・?)", "어리둥절"],
      ["¯\\_(ツ)_/¯", "어깨 으쓱"],
      ["(；・∀・)", "식은땀"],
    ],
  },
  {
    value: "shy",
    label: "수줍음 · 머쓱",
    keywords: "shy blush embarrassed 부끄러운 수줍 머쓱",
    faces: [
      ["(⁄ ⁄•⁄ω⁄•⁄ ⁄)", "부끄러워"],
      ["(*ﾉωﾉ)", "얼굴 가리기"],
      ["(〃▽〃)", "발그레"],
      ["(*/▽＼*)", "쑥스러워"],
      ["(｡•̀ᴗ-)✧", "윙크"],
      ["(๑>◡<๑)", "헤헤"],
    ],
  },
  {
    value: "greeting",
    label: "인사 · 감사",
    keywords: "hello hi bye wave thanks bow 안녕 인사 감사 고마워",
    faces: [
      ["(・ω・)ノ", "안녕"],
      ["ヾ(＾-＾)ノ", "반가워"],
      ["(*・ω・)ﾉ", "손 흔들기"],
      ["m(_ _)m", "꾸벅"],
      ["(人´∀`)", "고마워"],
      ["(￣^￣)ゞ", "경례"],
    ],
  },
  {
    value: "animals",
    label: "동물",
    keywords: "animal cute 동물 귀여운",
    faces: [
      ["(=^･ω･^=)", "고양이", "cat"],
      ["ʕ•ᴥ•ʔ", "곰", "bear"],
      ["U・ᴥ・U", "강아지", "dog"],
      ["／(･ × ･)＼", "토끼", "rabbit bunny"],
      ["(•ө•)", "새", "bird"],
      ["(=｀ω´=)", "도도한 고양이", "cat"],
    ],
  },
  {
    value: "relaxed",
    label: "여유 · 졸림",
    keywords: "sleep sleepy relax tired tea dance music 자는 졸린 피곤 여유",
    faces: [
      ["(－ω－) zzZ", "쿨쿨"],
      ["( ˘ω˘ )", "평온"],
      ["(￣ρ￣)..zzZZ", "졸려"],
      ["( ˘▽˘)っ♨", "차 한 잔"],
      ["♪ヽ(^^ヽ)♪", "춤추기"],
      ["(⌐■_■)", "쿨하게"],
    ],
  },
];

export const kaomojiCategories = moods.map(({ value, label }) => ({ value, label }));

export const kaomojiOptions: EmojiOption[] = moods.flatMap((mood) =>
  mood.faces.map(([text, label, keywords]) => ({
    text,
    label,
    category: mood.value,
    search: `${text} ${label} ${mood.label} ${mood.keywords} ${keywords ?? ""}`
      .normalize("NFKC")
      .toLowerCase(),
  })),
);
