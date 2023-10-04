export const translateCases = ["none", "spanish", "german", "bruh", "intellegizer"] as const
export type TranslateCase = typeof translateCases[number]