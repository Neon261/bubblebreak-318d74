import { HOME } from '@/lib/hamburgSpots';
import type { IntroAnswers, IntroCategoryId, Person, ReadyMinutes } from '@/lib/types';

/**
 * Recording fixture for the Sandra-to-Wiebke walkthrough. Keeping it in one
 * place makes the scripted path reproducible without bypassing any screens.
 */
export const RECORDING_SCENARIO = {
  userName: 'Sandra',
  spotId: 'hh-spritzenplatz',
  radiusKm: 3,
  location: HOME,
  locationDetails: { district: 'Ottensen', city: 'Hamburg' },
  intro: {
    doing: { questionId: 'fastest', optionId: 'food' },
    personality: { questionId: 'strangers', optionId: 'questions' },
    funfact: { questionId: 'useless-talent', optionId: 'dogs' },
    hobby: { questionId: 'spare-time', optionId: 'coffee' },
    signature: { questionId: 'ending', optionId: 'dance' },
  } satisfies Record<IntroCategoryId, { questionId: string; optionId: string }>,
  hostReadyMinutes: 30 as ReadyMinutes,
  guestReadyMinutes: 15 as ReadyMinutes,
  verificationReference: 'VRT-SANDRA26',
} as const;

export const WIEBKE: Person = {
  id: 'p-wiebke',
  name: 'Wiebke',
  bio: 'I know every market in Ottensen and always bring one more person into the conversation.',
  colorClass: 'bg-grape',
  interests: ['food', 'talks'],
  location: { latitude: 53.554, longitude: 9.931 },
  travelMode: 'bike',
  notificationsEnabled: true,
  vibe: 'eager',
};

/** Start onboarding empty while keeping Sandra's five questions fixed. */
export function recordingIntroPicks(): IntroAnswers {
  return Object.fromEntries(
    Object.entries(RECORDING_SCENARIO.intro).map(([categoryId, answer]) => [
      categoryId,
      { questionId: answer.questionId },
    ]),
  );
}
