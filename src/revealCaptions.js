// ═══════════════════════════════════════════════════════════════════════════
//  ECMEET'26 — Sorting Hat Captions & Audio Combinations
//  All audio file names and their captions live here.
//  The reveal page reads from this file — edit captions/audio here only.
// ═══════════════════════════════════════════════════════════════════════════

export const HAT_AUDIO = {

  idle: [
    {
      file: 'hat_idle_1.mp3',
      caption: 'Hmm... another student approaches. Let me see now... let me see.',
    },
    {
      file: 'hat_idle_2.mp3',
      caption: 'Ah, a new mind to read. Difficult... very difficult indeed.',
    },
    {
      file: 'hat_idle_3.mp3',
      caption: "Come now, don't be shy. The Sorting Hat sees all... every thought, every fear, every dream.",
    },
    {
      file: 'hat_idle_4.mp3',
      caption: 'Hmm hmm hmm... interesting. Very interesting. Sit still now while I think.',
    },
    {
      file: 'hat_idle_5.mp3',
      caption: 'So many qualities hidden in one mind. This will take a moment.',
    },
  ],

  thinking: [
    {
      file: 'hat_thinking_1.mp3',
      caption: 'I sense tremendous potential here. Courage, cunning, wisdom, loyalty... yes, yes, I can feel it all.',
    },
    {
      file: 'hat_thinking_2.mp3',
      caption: 'There is great bravery here... but also sharp cleverness. Hmm. Not easy, not easy at all.',
    },
    {
      file: 'hat_thinking_3.mp3',
      caption: 'A thirst for knowledge... loyalty to the core... and yet, something more. Something special.',
    },
    {
      file: 'hat_thinking_4.mp3',
      caption: "Oh, this is a fine mind. I haven't seen one quite like this in a long time.",
    },
    {
      file: 'hat_thinking_5.mp3',
      caption: 'The heart is true, the spirit strong. I know exactly where you belong.',
    },
  ],

  reading: [
    {
      file: 'hat_reading_1.mp3',
      caption: 'Ah yes... it is becoming clear to me now. Your destiny is written in the stars themselves!',
    },
    {
      file: 'hat_reading_2.mp3',
      caption: 'Yes... yes, I see it now. There is no doubt in my ancient mind.',
    },
    {
      file: 'hat_reading_3.mp3',
      caption: 'You cannot hide from the Sorting Hat. I know who you are... and where you truly belong.',
    },
    {
      file: 'hat_reading_4.mp3',
      caption: 'The path is clear. It has always been clear. You were made for this house.',
    },
    {
      file: 'hat_reading_5.mp3',
      caption: 'Remarkable. Truly remarkable. This house will be very lucky to have you.',
    },
  ],

  chosen: [
    {
      file: 'hat_chosen_1.mp3',
      caption: 'I have made my decision!',
    },
    {
      file: 'hat_chosen_2.mp3',
      caption: 'The hat has spoken!',
    },
    {
      file: 'hat_chosen_3.mp3',
      caption: 'It is decided. It is done!',
    },
    {
      file: 'hat_chosen_4.mp3',
      caption: 'There is no question. None at all!',
    },
  ],

  house: {
    Gryffindor: [
      { file: 'hat_gryffindor_1.mp3', caption: 'Better be... ' }, //GRYFFINDOR!
      { file: 'hat_gryffindor_2.mp3', caption: 'Where dwell the brave at heart! ' },
      { file: 'hat_gryffindor_3.mp3', caption: 'Courage, nerve, and chivalry. You belong in...' },
    ],
    Slytherin: [
      { file: 'hat_slytherin_1.mp3', caption: 'Better be... ' }, //SLYTHERIN!
      { file: 'hat_slytherin_2.mp3', caption: 'Cunning, ambitious, and resourceful. ' },
      { file: 'hat_slytherin_3.mp3', caption: 'You will achieve great things. ' },
    ],
    Ravenclaw: [
      { file: 'hat_ravenclaw_1.mp3', caption: 'Better be... ' }, //RAVENCLAW!
      { file: 'hat_ravenclaw_2.mp3', caption: 'A keen and curious mind. ' },
      { file: 'hat_ravenclaw_3.mp3', caption: "Wit beyond measure is man's greatest treasure. " },
    ],
    Hufflepuff: [
      { file: 'hat_hufflepuff_1.mp3', caption: 'Better be... ' }, //HUFFLEPUFF!
      { file: 'hat_hufflepuff_2.mp3', caption: 'Loyal, patient, true and kind. ' },
      { file: 'hat_hufflepuff_3.mp3', caption: 'Hard work and dedication define you. ' },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  Combination logic — pick random indices once, persist per user
// ─────────────────────────────────────────────────────────────────────────────

const rand = arr => Math.floor(Math.random() * arr.length);

/**
 * Returns the stored combo for this user, or generates + saves a new one.
 * combo = { idleIdx, thinkingIdx, readingIdx, chosenIdx, houseIdx }
 */
export function getOrCreateCombo(userEmail, house) {
  const key = `hat_combo_${userEmail}`;
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // corrupt — regenerate
    }
  }

  const combo = {
    idleIdx:     rand(HAT_AUDIO.idle),
    thinkingIdx: rand(HAT_AUDIO.thinking),
    readingIdx:  rand(HAT_AUDIO.reading),
    chosenIdx:   rand(HAT_AUDIO.chosen),
    houseIdx:    house ? rand(HAT_AUDIO.house[house] || HAT_AUDIO.house.Gryffindor) : 0,
  };

  localStorage.setItem(key, JSON.stringify(combo));
  return combo;
}

/**
 * Update house index once we know the house (after API returns).
 * Only updates houseIdx if not already set for this house.
 */
export function finaliseHouseCombo(userEmail, house) {
  const key = `hat_combo_${userEmail}`;
  const stored = localStorage.getItem(key);
  let combo = stored ? JSON.parse(stored) : {};

  // Always keep the same houseIdx — generates once, reuses forever
  if (combo.houseIdx === undefined) {
    combo.houseIdx = rand(HAT_AUDIO.house[house] || []);
  }
  // Save with house locked in
  combo.house = house;
  localStorage.setItem(key, JSON.stringify(combo));
  return combo;
}

/**
 * Get audio entry for a step using a stored combo.
 */
export function getAudio(step, combo, house) {
  switch (step) {
    case 'idle':     return HAT_AUDIO.idle[combo.idleIdx     ?? 0];
    case 'thinking': return HAT_AUDIO.thinking[combo.thinkingIdx ?? 0];
    case 'reading':  return HAT_AUDIO.reading[combo.readingIdx  ?? 0];
    case 'chosen':   return HAT_AUDIO.chosen[combo.chosenIdx   ?? 0];
    case 'house': {
      const list = HAT_AUDIO.house[house] || HAT_AUDIO.house.Gryffindor;
      return list[combo.houseIdx ?? 0];
    }
    default: return null;
  }
}
