import type { IntroAnswers, IntroCategoryId, IntroPick } from '@/lib/types';

export interface IntroOption {
  id: string;
  /** What the person taps. */
  label: string;
  /** First-person fragment slotted into the sentence templates. */
  fragment: string;
}

export interface IntroQuestion {
  id: string;
  prompt: string;
  helper: string;
  options: IntroOption[];
}

/** The "none of these fit" route: type an answer instead of picking one. */
export interface IntroCustomPrompt {
  /** Sentence lead-in shown above the field, e.g. "Fun fact: I…". */
  lead: string;
  placeholder: string;
  /** Turns typed words into a fragment that fits this group's slot. */
  toFragment: (text: string) => string;
}

export interface IntroCategory {
  id: IntroCategoryId;
  /** Shown above the question so the topic is clear. */
  label: string;
  /** What this group is trying to learn about you. */
  about: string;
  custom: IntroCustomPrompt;
  /**
   * Every question here produces the same kind of fragment, so switching a
   * question never breaks the sentence.
   */
  questions: IntroQuestion[];
}

/**
 * Five groups, one question each, drawn at random from that group's pool.
 * Switching a question keeps you inside the same group.
 *
 * The intro reads as a self-introduction, so every fragment is written in the
 * first person. Fragment grammar per group:
 * - doing: noun phrase ("free food") — follows "I'd leave the house for …"
 * - personality: verb phrase that follows "I" ("ask three questions too many")
 * - funfact: verb phrase that follows "I" ("have never finished a crossword")
 * - hobby: gerund phrase ("rebuilding the same playlist every week")
 * - signature: verb phrase that follows "I" ("close down the dance floor")
 *
 * No copulas ("am the loud one") — they read stiff after "I", so those answers
 * are phrased with a plain verb instead ("get called the loud one").
 */
export const INTRO_CATEGORIES: IntroCategory[] = [
  {
    id: 'doing',
    label: 'What you are up for',
    about: 'The kind of plan you say yes to.',
    custom: {
      lead: "I'd leave the house for…",
      placeholder: 'a rooftop and cheap wine',
      toFragment: (text) => text,
    },
    questions: [
      {
        id: 'fastest',
        prompt: 'What gets you out of the house fastest?',
        helper: 'Be honest, nobody is grading this.',
        options: [
          { id: 'food', label: 'Free food', fragment: 'free food' },
          {
            id: 'music',
            label: 'Live music in a basement',
            fragment: "live music in somebody's basement",
          },
          {
            id: 'games',
            label: 'A game with total strangers',
            fragment: 'a board game with total strangers',
          },
          { id: 'sun', label: 'One hour of sunshine', fragment: 'one hour of unexpected sunshine' },
        ],
      },
      {
        id: 'tonight',
        prompt: 'Which evening would you say yes to tonight?',
        helper: 'Pick the one you would actually leave for.',
        options: [
          {
            id: 'table',
            label: 'A long table dinner with people I have never met',
            fragment: "a long table of people I've never met",
          },
          {
            id: 'walk',
            label: 'A walk with no destination',
            fragment: 'a walk with no destination',
          },
          {
            id: 'loud',
            label: 'A loud bar and a bad playlist',
            fragment: 'a loud bar and a bad playlist',
          },
          {
            id: 'museum',
            label: 'One museum room and a strong coffee',
            fragment: 'one museum room and a strong coffee',
          },
        ],
      },
      {
        id: 'saturday',
        prompt: 'Your ideal Saturday afternoon looks like...',
        helper: 'Weather is whatever you want it to be.',
        options: [
          {
            id: 'market',
            label: 'A market with too many free samples',
            fragment: 'a market with too many free samples',
          },
          {
            id: 'pitch',
            label: 'A pitch, a ball, no plan afterwards',
            fragment: 'a pitch, a ball and no plan afterwards',
          },
          {
            id: 'bookshop',
            label: 'A bookshop I get lost in',
            fragment: 'a bookshop I can get lost in',
          },
          {
            id: 'swim',
            label: 'A swim in water that is too cold',
            fragment: 'a swim in water that is far too cold',
          },
        ],
      },
      {
        id: 'never-no',
        prompt: 'What can you never say no to?',
        helper: 'The thing that always works on you.',
        options: [
          { id: 'dessert', label: 'A second dessert', fragment: 'a second dessert' },
          {
            id: 'detour',
            label: 'A detour that adds an hour',
            fragment: 'a detour that adds an hour',
          },
          {
            id: 'pizza',
            label: 'An argument about the best pizza in town',
            fragment: 'an argument about the best pizza in town',
          },
          {
            id: 'tip',
            label: "A stranger's recommendation",
            fragment: "a stranger's recommendation",
          },
        ],
      },
    ],
  },
  {
    id: 'personality',
    label: 'How you are with people',
    about: 'The part strangers notice first.',
    custom: {
      lead: 'Around new people, I tend to…',
      placeholder: 'ask three questions too many',
      toFragment: (text) => `tend to ${text}`,
    },
    questions: [
      {
        id: 'strangers',
        prompt: 'What do you do around people you just met?',
        helper: 'This is the part strangers actually care about.',
        options: [
          {
            id: 'questions',
            label: 'Ask three questions too many',
            fragment: 'ask three questions too many',
          },
          {
            id: 'listen',
            label: 'Listen and collect their stories',
            fragment: "listen more than I talk and collect everyone else's stories",
          },
          {
            id: 'overshare',
            label: 'Over-share within five minutes',
            fragment: 'over-share within the first five minutes',
          },
          {
            id: 'groupchat',
            label: 'Start a group chat before dessert',
            fragment: 'start a group chat before dessert arrives',
          },
        ],
      },
      {
        id: 'plans',
        prompt: 'How do you handle plans?',
        helper: 'Think of the last three invitations you got.',
        options: [
          {
            id: 'yes',
            label: 'Say yes first, read the details later',
            fragment: 'say yes first and read the details later',
          },
          {
            id: 'early',
            label: 'Turn up ten minutes early, always',
            fragment: 'turn up ten minutes early, every single time',
          },
          {
            id: 'maybe',
            label: 'Keep one foot out of the door',
            fragment: 'keep one foot out of the door until the last minute',
          },
          {
            id: 'organise',
            label: 'End up organising everyone',
            fragment: 'end up quietly organising everyone',
          },
        ],
      },
      {
        id: 'friends',
        prompt: 'Your friends would describe you as...',
        helper: 'Their words, not yours.',
        options: [
          {
            id: 'calm',
            label: 'The calm one, until there is karaoke',
            fragment: 'stay the calm one right up until karaoke starts',
          },
          {
            id: 'loud',
            label: 'The loud one who means well',
            fragment: 'get called the loud one who means well',
          },
          {
            id: 'notices',
            label: 'The one who notices when someone goes quiet',
            fragment: 'notice the second someone goes quiet',
          },
          {
            id: 'opinion',
            label: 'The one with an opinion about everything',
            fragment: 'hold strong opinions about very small things',
          },
        ],
      },
      {
        id: 'group',
        prompt: 'In a group of six, you are usually...',
        helper: 'Same table, different jobs.',
        options: [
          {
            id: 'talk',
            label: 'Talking for forty minutes straight',
            fragment: 'keep a conversation going for forty minutes straight',
          },
          {
            id: 'edge',
            label: 'At the edge, making one very good joke',
            fragment: 'sit at the edge and land one very good joke',
          },
          {
            id: 'adopt',
            label: 'Adopting whoever came alone',
            fragment: 'adopt whoever turned up on their own',
          },
          {
            id: 'orders',
            label: "Taking everyone else's drink order",
            fragment: "remember everyone's drink order without asking twice",
          },
        ],
      },
    ],
  },
  {
    id: 'funfact',
    label: 'One fun fact',
    about: 'The bit people repeat about you later.',
    custom: {
      lead: 'Fun fact: I…',
      placeholder: 'have never finished a crossword',
      toFragment: (text) => text,
    },
    questions: [
      {
        id: 'useless-talent',
        prompt: 'Pick your most useless talent.',
        helper: 'The one people find out about eventually.',
        options: [
          {
            id: 'dogs',
            label: "I remember every dog's name",
            fragment: 'remember every dog in the neighbourhood by name',
          },
          {
            id: 'park',
            label: 'I can park anything, anywhere',
            fragment: 'can parallel park anything, anywhere',
          },
          {
            id: 'whistle',
            label: 'I still cannot whistle',
            fragment: 'still cannot whistle, and still try',
          },
          {
            id: 'songs',
            label: 'I name any song in two seconds',
            fragment: 'can name any song from two seconds of it',
          },
        ],
      },
      {
        id: 'oddly-true',
        prompt: 'Which one is oddly true about you?',
        helper: 'No wrong answer, only strange ones.',
        options: [
          {
            id: 'crossword',
            label: 'I have never finished a crossword',
            fragment: 'have never once finished a crossword',
          },
          {
            id: 'umbrellas',
            label: 'I own four umbrellas and lose them all',
            fragment: 'own four umbrellas and lose every one of them',
          },
          {
            id: 'reread',
            label: 'I have read the same book five times',
            fragment: 'have read the same book five times on purpose',
          },
          {
            id: 'podcast',
            label: 'I cannot sleep without a podcast on',
            fragment: 'cannot fall asleep without a podcast running',
          },
        ],
      },
      {
        id: 'one-time',
        prompt: 'Finish this: one time, I...',
        helper: 'Small stories welcome.',
        options: [
          {
            id: 'laugh',
            label: 'Made a stranger laugh in ten seconds',
            fragment: 'once got a stranger laughing in under ten seconds',
          },
          {
            id: 'train',
            label: 'Missed a train on purpose',
            fragment: 'once missed a train entirely on purpose',
          },
          {
            id: 'quiz',
            label: 'Won a pub quiz on one lucky answer',
            fragment: 'once won a pub quiz on a single lucky guess',
          },
          {
            id: 'cooked',
            label: 'Cooked for twelve with no recipe',
            fragment: 'once cooked for twelve people with no recipe',
          },
        ],
      },
      {
        id: 'proud',
        prompt: 'What are you secretly proud of?',
        helper: 'Nobody asked, but here we are.',
        options: [
          {
            id: 'eggs',
            label: 'My scrambled eggs',
            fragment: 'make the best scrambled eggs of anyone I know',
          },
          {
            id: 'golf',
            label: 'Never losing at mini golf',
            fragment: 'have never lost a game of mini golf',
          },
          {
            id: 'sleep',
            label: 'Falling asleep anywhere in four minutes',
            fragment: 'can fall asleep anywhere within four minutes',
          },
          {
            id: 'directions',
            label: 'Giving better directions than a map app',
            fragment: 'give better directions than any map app',
          },
        ],
      },
    ],
  },
  {
    id: 'hobby',
    label: 'Your hobby',
    about: 'Where your spare hours actually go.',
    custom: {
      lead: 'My spare time goes on…',
      placeholder: 'rebuilding the same playlist',
      toFragment: (text) => text,
    },
    questions: [
      {
        id: 'spare-time',
        prompt: 'Where does your spare time go?',
        helper: 'Check your last two weekends.',
        options: [
          {
            id: 'coffee',
            label: 'Hunting a decent espresso',
            fragment: 'chasing a decent espresso across town',
          },
          {
            id: 'playlists',
            label: 'Rebuilding the same playlist',
            fragment: 'rebuilding the same playlist every single week',
          },
          {
            id: 'running',
            label: 'Running slowly but often',
            fragment: 'running slowly but very often',
          },
          {
            id: 'bike',
            label: 'Fixing a bike that stays broken',
            fragment: 'fixing a bike that will never quite be fixed',
          },
        ],
      },
      {
        id: 'deep-into',
        prompt: 'What are you deep into right now?',
        helper: 'The thing you would talk about unprompted.',
        options: [
          {
            id: 'language',
            label: 'A language app streak',
            fragment: 'learning a language on a nine-week streak',
          },
          {
            id: 'photos',
            label: 'Photographing doors nobody notices',
            fragment: 'photographing doors nobody else notices',
          },
          {
            id: 'dish',
            label: 'Perfecting one single dish',
            fragment: 'cooking one dish until it is perfect',
          },
          {
            id: 'climbing',
            label: 'Climbing indoors, talking about it outdoors',
            fragment: 'climbing walls indoors and talking about it outdoors',
          },
        ],
      },
      {
        id: 'make-keep',
        prompt: 'What do you make, keep or grow?',
        helper: 'Results do not have to be good.',
        options: [
          {
            id: 'plants',
            label: 'Plants, with mixed results',
            fragment: 'growing plants with deeply mixed results',
          },
          {
            id: 'notebook',
            label: 'A notebook of overheard lines',
            fragment: 'filling a notebook with overheard lines',
          },
          {
            id: 'ceramics',
            label: 'Ceramics that lean slightly',
            fragment: 'making ceramics that lean slightly to the left',
          },
          {
            id: 'records',
            label: 'Records I cannot play yet',
            fragment: 'collecting records I cannot play yet',
          },
        ],
      },
      {
        id: 'whole-sunday',
        prompt: 'What could you spend a whole Sunday on?',
        helper: 'Phone off, no interruptions.',
        options: [
          {
            id: 'chess',
            label: 'Getting slowly better at chess',
            fragment: 'getting better at chess extremely slowly',
          },
          {
            id: 'streets',
            label: 'Walking every street of one area',
            fragment: 'walking every street of one neighbourhood',
          },
          {
            id: 'bread',
            label: 'Baking bread, with opinions',
            fragment: 'baking bread with very strong opinions about it',
          },
          {
            id: 'drawing',
            label: 'Drawing strangers badly from memory',
            fragment: 'drawing strangers badly from memory',
          },
        ],
      },
    ],
  },
  {
    id: 'signature',
    label: 'Your signature move',
    about: 'How your nights out tend to go.',
    custom: {
      lead: 'A good night out and I…',
      placeholder: 'close down the dance floor',
      toFragment: (text) => text,
    },
    questions: [
      {
        id: 'ending',
        prompt: 'How does a good night usually end?',
        helper: 'Last one, then you get your sentence.',
        options: [
          {
            id: 'dance',
            label: 'Last one off the dance floor',
            fragment: 'close down the dance floor',
          },
          {
            id: 'kebab',
            label: 'At the late-night kebab place',
            fragment: 'end up at the late-night kebab place',
          },
          {
            id: 'early',
            label: 'Home by half ten, no regrets',
            fragment: 'get home by half ten with zero regrets',
          },
          {
            id: 'films',
            label: 'Arguing about films at a bus stop',
            fragment: 'argue about films at a bus stop',
          },
        ],
      },
      {
        id: 'leaving',
        prompt: 'How do you leave a party?',
        helper: 'We all have a method.',
        options: [
          {
            id: 'numbers',
            label: 'With two new phone numbers',
            fragment: 'leave with two new phone numbers',
          },
          {
            id: 'ghost',
            label: 'Without saying goodbye to anyone',
            fragment: 'vanish without saying goodbye to anyone',
          },
          {
            id: 'dishes',
            label: 'Last one helping with the dishes',
            fragment: 'stay to the end and help with the dishes',
          },
          {
            id: 'announce',
            label: 'Announcing I am leaving, then staying an hour',
            fragment: 'announce that I am leaving and then stay another hour',
          },
        ],
      },
      {
        id: 'morning-after',
        prompt: 'The morning after a good night, you...',
        helper: 'Whatever happens before noon.',
        options: [
          {
            id: 'photo',
            label: 'Send a photo nobody remembers taking',
            fragment: 'send round a photo nobody remembers taking',
          },
          {
            id: 'walk',
            label: 'Go for a walk before everyone wakes up',
            fragment: 'go out walking before anyone else wakes up',
          },
          {
            id: 'breakfast',
            label: 'Make breakfast for whoever is around',
            fragment: 'make breakfast for whoever is still around',
          },
          {
            id: 'recap',
            label: 'Text the group chat a full recap',
            fragment: 'text the group chat a full recap',
          },
        ],
      },
      {
        id: 'they-say',
        prompt: 'What do people say about a night out with you?',
        helper: 'The line you have heard more than once.',
        options: [
          {
            id: 'table',
            label: 'They always find the good table',
            fragment: 'find the one good table',
          },
          {
            id: 'quick',
            label: 'A quick drink turns into a whole evening',
            fragment: 'turn a quick drink into a whole evening',
          },
          {
            id: 'open',
            label: 'They know somewhere that is still open',
            fragment: 'know a place that is open, whatever the hour',
          },
          {
            id: 'home',
            label: 'They get everyone home safely',
            fragment: 'get everyone home safely, then carry on',
          },
        ],
      },
    ],
  },
];

export const INTRO_CATEGORY_IDS: IntroCategoryId[] = INTRO_CATEGORIES.map(
  (category) => category.id,
);

export const INTRO_CATEGORY_COUNT = INTRO_CATEGORIES.length;

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * A self-introduction in two or three short sentences. Every template uses all
 * five answers, wrapped in phrasing that carries the sentence, so the result
 * reads like something a person wrote rather than five answers glued together.
 * A shuffle moves to the next template.
 */
const TEMPLATES: ((parts: Record<IntroCategoryId, string>) => string)[] = [
  (parts) =>
    `Say ${parts.doing} and I'm out the door. Around new people I ${parts.personality}, and nine times out of ten I ${parts.signature}. My spare hours go into ${parts.hobby} — and fun fact, I ${parts.funfact}.`,
  (parts) =>
    `I'd rearrange a whole evening for ${parts.doing}. With people I've just met I ${parts.personality}, and sooner or later I ${parts.signature}. When nobody needs me you'll find me ${parts.hobby}, and for the record, I ${parts.funfact}.`,
  (parts) =>
    `Most weeks I'm ${parts.hobby}, but I'd drop all of it for ${parts.doing}. I ${parts.personality}, and true to form I ${parts.signature}. Fun fact: I ${parts.funfact}.`,
  (parts) =>
    `${capitalise(parts.doing)}? I'm already on my way. I ${parts.personality}, and by the end of it I ${parts.signature}. The rest of my time goes on ${parts.hobby} — and yes, I ${parts.funfact}.`,
  (parts) =>
    `I ${parts.personality}, which is probably the fastest way to get to know me. Give me ${parts.doing} and I'll clear the evening, then nine times out of ten I ${parts.signature}. I spend far too long ${parts.hobby}, and somehow I ${parts.funfact}.`,
];

export const INTRO_TEMPLATE_COUNT = TEMPLATES.length;

export function introCategory(id: IntroCategoryId): IntroCategory | undefined {
  return INTRO_CATEGORIES.find((category) => category.id === id);
}

export function introQuestion(
  categoryId: IntroCategoryId,
  questionId: string | undefined,
): IntroQuestion | undefined {
  if (!questionId) return undefined;
  return introCategory(categoryId)?.questions.find((question) => question.id === questionId);
}

/** The question currently on screen for a group, falling back to the first one. */
export function currentIntroQuestion(
  categoryId: IntroCategoryId,
  answers: IntroAnswers,
): IntroQuestion | undefined {
  const category = introCategory(categoryId);
  if (!category) return undefined;
  return introQuestion(categoryId, answers[categoryId]?.questionId) ?? category.questions[0];
}

function randomItem<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined;
  return items[Math.floor(Math.random() * items.length)];
}

export const CUSTOM_ANSWER_MIN_LENGTH = 4;
export const CUSTOM_ANSWER_MAX_LENGTH = 90;

/**
 * Words that are safe to lower-case when they open a typed answer, so
 * "Ask too many questions" reads properly mid-sentence. Anything else keeps
 * its capital, because it is probably a name or a place.
 */
const LOWERCASE_STARTERS = new Set([
  'a',
  'always',
  'an',
  'anything',
  'ask',
  'asking',
  'bake',
  'baking',
  'bring',
  'build',
  'building',
  'can',
  'cannot',
  'close',
  'collect',
  'collecting',
  'cook',
  'cooking',
  'dance',
  'dancing',
  'draw',
  'drawing',
  'end',
  'find',
  'fix',
  'fixing',
  'get',
  'getting',
  'go',
  'going',
  'have',
  'keep',
  'keeping',
  'know',
  'learn',
  'learning',
  'like',
  'listen',
  'love',
  'make',
  'making',
  'my',
  'need',
  'never',
  'once',
  'one',
  'own',
  'play',
  'playing',
  'read',
  'reading',
  'remember',
  'run',
  'running',
  'say',
  'sing',
  'singing',
  'sit',
  'spend',
  'spending',
  'stay',
  'still',
  'take',
  'talk',
  'talking',
  'tell',
  'the',
  'turn',
  'two',
  'walk',
  'walking',
  'watch',
  'watching',
  'will',
  'write',
  'writing',
]);

/** Tidies a typed answer so it can be dropped into the sentence templates. */
export function cleanCustomText(text: string): string {
  const collapsed = text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.,;:!]+$/, '')
    // The lead-in already says "I", so a repeated one would read twice.
    .replace(/^i['’]?m? /i, '')
    .replace(/^to /i, '')
    .trim();

  const space = collapsed.indexOf(' ');
  const head = space === -1 ? collapsed : collapsed.slice(0, space);
  const lower = head.toLowerCase();
  if (!LOWERCASE_STARTERS.has(lower)) return collapsed;
  return lower + collapsed.slice(head.length);
}

/** The typed answer, shaped for this group's slot in the sentence. */
export function customIntroFragment(categoryId: IntroCategoryId, text: string): string {
  const cleaned = cleanCustomText(text);
  if (!cleaned) return '';
  const category = introCategory(categoryId);
  return category ? category.custom.toFragment(cleaned) : cleaned;
}

/** True once a group has either a tapped option or a typed answer. */
export function hasIntroAnswer(pick: IntroPick | undefined): boolean {
  if (!pick) return false;
  return Boolean(pick.optionId) || cleanCustomText(pick.customText ?? '').length > 0;
}

/** The fragment behind a group's answer, typed or tapped. */
function introFragment(categoryId: IntroCategoryId, pick: IntroPick | undefined): string {
  if (!pick) return '';
  if (pick.customText) return customIntroFragment(categoryId, pick.customText);
  return (
    introQuestion(categoryId, pick.questionId)?.options.find(
      (option) => option.id === pick.optionId,
    )?.fragment ?? ''
  );
}

/** A random question from this group only — never from another group. */
export function randomIntroQuestionId(
  categoryId: IntroCategoryId,
  excludeQuestionId?: string,
): string | undefined {
  const questions = introCategory(categoryId)?.questions ?? [];
  const pool = questions.filter((question) => question.id !== excludeQuestionId);
  return randomItem(pool.length > 0 ? pool : questions)?.id;
}

/** One random, unanswered question per group — the set a new person sees. */
export function randomIntroPicks(): IntroAnswers {
  const picks: IntroAnswers = {};
  for (const category of INTRO_CATEGORIES) {
    const questionId = randomIntroQuestionId(category.id);
    if (questionId) picks[category.id] = { questionId };
  }
  return picks;
}

/** Fills in any group that has no question yet, keeping existing picks. */
export function withIntroPicks(answers: IntroAnswers): IntroAnswers {
  let next: IntroAnswers | undefined;
  for (const category of INTRO_CATEGORIES) {
    if (answers[category.id]) continue;
    const questionId = randomIntroQuestionId(category.id);
    if (!questionId) continue;
    next = next ?? { ...answers };
    next[category.id] = { questionId };
  }
  return next ?? answers;
}

/** Swaps in another question from the same group and drops the old answer. */
export function switchedIntroPick(
  categoryId: IntroCategoryId,
  answers: IntroAnswers,
): IntroPick | undefined {
  const current = currentIntroQuestion(categoryId, answers);
  const questionId = randomIntroQuestionId(categoryId, current?.id);
  return questionId ? { questionId } : undefined;
}

/** Index of the first group without an answer, or the count when all are done. */
export function firstUnansweredIndex(answers: IntroAnswers): number {
  const index = INTRO_CATEGORIES.findIndex((category) => !hasIntroAnswer(answers[category.id]));
  return index === -1 ? INTRO_CATEGORIES.length : index;
}

export function hasAllIntroAnswers(answers: IntroAnswers): boolean {
  return INTRO_CATEGORY_IDS.every((id) => hasIntroAnswer(answers[id]));
}

function hasEveryFragment(
  parts: Partial<Record<IntroCategoryId, string>>,
): parts is Record<IntroCategoryId, string> {
  return INTRO_CATEGORY_IDS.every((id) => typeof parts[id] === 'string');
}

/**
 * Builds the self-introduction other people read. Written in the first person,
 * so it never uses the name it sits under. Returns an empty string until all
 * five answers exist.
 */
export function buildIntroSentence(answers: IntroAnswers, variant: number): string {
  const parts: Partial<Record<IntroCategoryId, string>> = {};
  for (const id of INTRO_CATEGORY_IDS) {
    const fragment = introFragment(id, answers[id]);
    if (!fragment) return '';
    parts[id] = fragment;
  }
  if (!hasEveryFragment(parts)) return '';

  const template = TEMPLATES[((variant % TEMPLATES.length) + TEMPLATES.length) % TEMPLATES.length];
  return template ? template(parts) : '';
}
