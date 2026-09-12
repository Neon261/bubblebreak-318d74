import type { IntroAnswers, IntroQuestionId } from '@/lib/types';

export interface IntroOption {
  id: string;
  /** What the person taps. */
  label: string;
  /** Third-person fragment slotted into the sentence templates. */
  fragment: string;
}

export interface IntroQuestion {
  id: IntroQuestionId;
  prompt: string;
  helper: string;
  options: IntroOption[];
}

/**
 * Five taps, five fragments. Every option is written so it can be dropped into
 * any template slot for its question without breaking the grammar.
 */
export const INTRO_QUESTIONS: IntroQuestion[] = [
  {
    id: 'pull',
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
      {
        id: 'late',
        label: 'A slightly bad idea at 11pm',
        fragment: 'a slightly bad idea after 11pm',
      },
    ],
  },
  {
    id: 'talent',
    prompt: 'Pick your most useless talent.',
    helper: 'The one people find out about eventually.',
    options: [
      {
        id: 'dogs',
        label: "I remember every dog's name",
        fragment: 'remembers every dog in the neighbourhood by name',
      },
      {
        id: 'park',
        label: 'I can park anything, anywhere',
        fragment: 'can parallel park anything, anywhere',
      },
      {
        id: 'talk',
        label: 'I can talk for 40 minutes straight',
        fragment: 'can keep a conversation going for forty minutes',
      },
      {
        id: 'table',
        label: 'I always find the good table',
        fragment: 'always finds the one good table',
      },
      {
        id: 'whistle',
        label: 'I still cannot whistle',
        fragment: 'still cannot whistle, still tries',
      },
    ],
  },
  {
    id: 'strangers',
    prompt: 'What do you do around people you just met?',
    helper: 'This is the part strangers actually care about.',
    options: [
      {
        id: 'questions',
        label: 'Ask three questions too many',
        fragment: 'asks strangers three questions too many',
      },
      {
        id: 'listen',
        label: 'Listen and collect their stories',
        fragment: "listens quietly and collects everyone else's stories",
      },
      {
        id: 'overshare',
        label: 'Over-share within five minutes',
        fragment: 'over-shares within the first five minutes',
      },
      {
        id: 'hover',
        label: 'Hover until someone adopts me',
        fragment: 'hovers politely until someone adopts them',
      },
      {
        id: 'groupchat',
        label: 'Start a group chat before dessert',
        fragment: 'starts a group chat before dessert',
      },
    ],
  },
  {
    id: 'object',
    prompt: 'What are you never without?',
    helper: 'Check your bag if you need to.',
    options: [
      {
        id: 'tote',
        label: 'A tote bag with something odd in it',
        fragment: 'a tote bag with something odd in it',
      },
      {
        id: 'headphones',
        label: 'Headphones that never come off',
        fragment: 'headphones that never come off',
      },
      {
        id: 'snacks',
        label: 'Snacks meant for other people',
        fragment: 'snacks meant for other people',
      },
      {
        id: 'books',
        label: 'Three books, none started',
        fragment: 'three books, none of them started',
      },
      {
        id: 'umbrella',
        label: 'An umbrella and no plan',
        fragment: 'an umbrella and absolutely no plan',
      },
    ],
  },
  {
    id: 'ending',
    prompt: 'How does a good night usually end?',
    helper: 'Last one, then you get your sentence.',
    options: [
      {
        id: 'dance',
        label: 'Last one off the dance floor',
        fragment: 'closes down the dance floor',
      },
      {
        id: 'kebab',
        label: 'At the late-night kebab place',
        fragment: 'ends up at the late-night kebab place',
      },
      {
        id: 'early',
        label: 'Home by half ten, no regrets',
        fragment: 'is home by half ten with zero regrets',
      },
      {
        id: 'films',
        label: 'Arguing about films at a bus stop',
        fragment: 'argues about films at a bus stop',
      },
      {
        id: 'numbers',
        label: 'With two new phone numbers',
        fragment: 'leaves with two new phone numbers',
      },
    ],
  },
];

const QUESTION_IDS: IntroQuestionId[] = INTRO_QUESTIONS.map((question) => question.id);

/** Templates take every fragment slot; a shuffle just moves to the next one. */
const TEMPLATES: ((parts: Record<IntroQuestionId, string>, name: string) => string)[] = [
  (parts, name) =>
    `${name} turns up for ${parts.pull}, ${parts.talent}, and somehow always ${parts.ending}.`,
  (parts, name) =>
    `${name} would cross town for ${parts.pull}, ${parts.strangers}, and never leaves home without ${parts.object}.`,
  (parts, name) =>
    `Give ${name} ${parts.pull} and a room full of strangers: ${parts.talent}, then ${parts.ending}.`,
  (parts, name) =>
    `${name}: ${parts.strangers}, ${parts.talent}, and runs entirely on ${parts.pull}.`,
  (parts, name) =>
    `${name} shows up with ${parts.object}, ${parts.strangers}, and ${parts.ending} — all for ${parts.pull}.`,
];

export const INTRO_TEMPLATE_COUNT = TEMPLATES.length;

export function introQuestion(id: IntroQuestionId): IntroQuestion | undefined {
  return INTRO_QUESTIONS.find((question) => question.id === id);
}

export function introOption(
  id: IntroQuestionId,
  optionId: string | undefined,
): IntroOption | undefined {
  if (!optionId) return undefined;
  return introQuestion(id)?.options.find((option) => option.id === optionId);
}

/** Index of the first question without an answer, or the count when all are done. */
export function firstUnansweredIndex(answers: IntroAnswers): number {
  const index = INTRO_QUESTIONS.findIndex((question) => !answers[question.id]);
  return index === -1 ? INTRO_QUESTIONS.length : index;
}

export function hasAllIntroAnswers(answers: IntroAnswers): boolean {
  return QUESTION_IDS.every((id) => Boolean(answers[id]));
}

function hasEveryFragment(
  parts: Partial<Record<IntroQuestionId, string>>,
): parts is Record<IntroQuestionId, string> {
  return QUESTION_IDS.every((id) => typeof parts[id] === 'string');
}

/**
 * Builds the single funny line shown to other people. Returns an empty string
 * until the name and all five answers exist.
 */
export function buildIntroSentence(
  firstName: string,
  answers: IntroAnswers,
  variant: number,
): string {
  const name = firstName.trim();
  if (!name || !hasAllIntroAnswers(answers)) return '';

  const parts: Partial<Record<IntroQuestionId, string>> = {};
  for (const id of QUESTION_IDS) {
    const fragment = introOption(id, answers[id])?.fragment;
    if (!fragment) return '';
    parts[id] = fragment;
  }
  if (!hasEveryFragment(parts)) return '';

  const template = TEMPLATES[((variant % TEMPLATES.length) + TEMPLATES.length) % TEMPLATES.length];
  return template ? template(parts, name) : '';
}
