const has72HoursPassed = (offerExpired?: string | Date | null): boolean => {
  if (!offerExpired) return false;

  const diff = Date.now() - new Date(offerExpired).getTime();
  return diff >= 72 * 60 * 60 * 1000;
};

export const TimeChecker = {
  has72HoursPassed,
};
