export function capitalizeMonthName(input: string): string {
  return input
    ?.split(",")
    .map((range) =>
      range
        .trim()
        .split("-")
        .map(
          (word) =>
            word.trim().charAt(0).toUpperCase() +
            word.trim().slice(1).toLowerCase()
        )
        .join("-")
    )
    .join(", ");
}
