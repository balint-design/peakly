import { languages, countries } from 'countries-list';

export type Language = {
  code: string;
  name: string;
  native: string;
  flag: string;
};

// Convert countries-list data into our format
const languagesList: Language[] = Object.entries(languages)
  .map(([code, data]) => {
    // Find a country that uses this language as primary
    const country = Object.entries(countries).find(([_, countryData]) => 
      countryData.languages[0] === code
    );

    return {
      code: code.toUpperCase(),
      name: data.name,
      native: data.native,
      // Use the flag emoji from the country, or fallback to a generic flag
      flag: country ? country[1].emoji : '🏳️'
    };
  })
  // Sort by native name
  .sort((a, b) => a.native.localeCompare(b.native));

export { languagesList };