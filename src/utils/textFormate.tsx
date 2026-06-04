export function TextCaseFormat(input: string) {
  const prepositions = [
    "is",
    "the",
    "within",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "having",
    "a",
    "an",
    "and",
    "of",
    "in",
    "on",
    "at",
    "by",
    "for",
    "with",
    "about",
    "against",
    "between",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "to",
    "from",
    "up",
    "down",
    "over",
    "under",
  ];
  const capitalWords = ["hesa"];

  return input
    .toLowerCase()
    .split(" ")
    .map((word, index) => {
      if (prepositions.includes(word) && index !== 0) {
        return word;
      } else if (capitalWords.includes(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}
