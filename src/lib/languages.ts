// Languages Sarvam speech-to-text supports. Keep in sync with SPEECH_LANGUAGES in the backend validator
export const LANGUAGES: Record<string, string> = {
  'as-IN': 'Assamese',
  'bn-IN': 'Bengali',
  'brx-IN': 'Bodo',
  'doi-IN': 'Dogri',
  'en-IN': 'English',
  'gu-IN': 'Gujarati',
  'hi-IN': 'Hindi',
  'kn-IN': 'Kannada',
  'ks-IN': 'Kashmiri',
  'kok-IN': 'Konkani',
  'mai-IN': 'Maithili',
  'ml-IN': 'Malayalam',
  'mni-IN': 'Manipuri',
  'mr-IN': 'Marathi',
  'ne-IN': 'Nepali',
  'od-IN': 'Odia',
  'pa-IN': 'Punjabi',
  'sa-IN': 'Sanskrit',
  'sat-IN': 'Santali',
  'sd-IN': 'Sindhi',
  'ta-IN': 'Tamil',
  'te-IN': 'Telugu',
  'ur-IN': 'Urdu',
}

export const languageName = (code: string | null | undefined) =>
  code ? (LANGUAGES[code] ?? (code === 'unknown' ? 'Unknown' : code)) : '-'
