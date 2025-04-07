// Define language types
export type Language = {
  code: string;
  name: string;
  native: string;
  flag: string;
};

// Hardcoded list of languages for German-speaking countries
const languagesList: Language[] = [
  {
    code: 'DE',
    name: 'German',
    native: 'Deutsch',
    flag: '🇩🇪'
  },
  {
    code: 'EN',
    name: 'English',
    native: 'English',
    flag: '🇬🇧'
  },
  {
    code: 'FR',
    name: 'French',
    native: 'Français',
    flag: '🇫🇷'
  },
  {
    code: 'IT',
    name: 'Italian',
    native: 'Italiano',
    flag: '🇮🇹'
  },
  {
    code: 'ES',
    name: 'Spanish',
    native: 'Español',
    flag: '🇪🇸'
  },
  {
    code: 'PT',
    name: 'Portuguese',
    native: 'Português',
    flag: '🇵🇹'
  },
  {
    code: 'NL',
    name: 'Dutch',
    native: 'Nederlands',
    flag: '🇳🇱'
  },
  {
    code: 'PL',
    name: 'Polish',
    native: 'Polski',
    flag: '🇵🇱'
  },
  {
    code: 'RU',
    name: 'Russian',
    native: 'Русский',
    flag: '🇷🇺'
  },
  {
    code: 'SE',
    name: 'Swedish',
    native: 'Svenska',
    flag: '🇸🇪'
  },
  {
    code: 'FI',
    name: 'Finnish',
    native: 'Suomi',
    flag: '🇫🇮'
  },
  {
    code: 'NO',
    name: 'Norwegian',
    native: 'Norsk',
    flag: '🇳🇴'
  },
  {
    code: 'DA',
    name: 'Danish',
    native: 'Dansk',
    flag: '🇩🇰'
  },
  {
    code: 'CS',
    name: 'Czech',
    native: 'Čeština',
    flag: '🇨🇿'
  },
  {
    code: 'SK',
    name: 'Slovak',
    native: 'Slovenčina',
    flag: '🇸🇰'
  },
  {
    code: 'HU',
    name: 'Hungarian',
    native: 'Magyar',
    flag: '🇭🇺'
  },
  {
    code: 'RO',
    name: 'Romanian',
    native: 'Română',
    flag: '🇷🇴'
  }
];

export { languagesList };