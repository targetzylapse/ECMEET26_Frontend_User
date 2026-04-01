export const COLLEGE = {
  name: 'Crescent University',
  eventName: "ECMEET'26",
  email: 'ecmeet@crescent.education',
  phone: '+91 99999 00000',
  allowedDomain: 'crescent.education',
};

export const TEAMS = {
  Gryffindor: {
    id: 'gryffindor',
    name: 'Gryffindor',
    logo: 'logo_gryffindor.png',
    colors: { primary: '#740001', secondary: '#D3A625' },
    traits: 'Bravery · Courage · Nerve',
    description: 'Where dwell the brave at heart!',
  },
  Slytherin: {
    id: 'slytherin',
    name: 'Slytherin',
    logo: 'logo_slytherin.png',
    colors: { primary: '#1A472A', secondary: '#AAAAAA' },
    traits: 'Ambition · Cunning · Leadership',
    description: 'Those cunning folk use any means to achieve their ends!',
  },
  Ravenclaw: {
    id: 'ravenclaw',
    name: 'Ravenclaw',
    logo: 'logo_ravenclaw.png',
    colors: { primary: '#0E1A40', secondary: '#946B2D' },
    traits: 'Wisdom · Intelligence · Wit',
    description: "If you've a ready mind, choose the wisest, most refined!",
  },
  Hufflepuff: {
    id: 'hufflepuff',
    name: 'Hufflepuff',
    logo: 'logo_hufflepuff.png',
    colors: { primary: '#ECB939', secondary: '#726255' },
    traits: 'Patience · Loyalty · Hard Work',
    description: 'The true, the loyal, the patient, the kind!',
  },
};

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
