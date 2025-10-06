export const extractFromText = (text: string, regex: RegExp) => {
  const match = text.match(regex);
  return match ? match[0] : undefined;
};
