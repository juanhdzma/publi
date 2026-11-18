export const resolveAttribution = (
  source: string | null | undefined,
  entryAuthor: string,
  unknownAuthor: string,
): string => (source === undefined ? entryAuthor : (source ?? unknownAuthor));
