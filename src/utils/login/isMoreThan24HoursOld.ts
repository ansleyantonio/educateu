function isMoreThan24HoursOld(dateString: string, hours: number = 24) {
  const givenDate = new Date(dateString);
  const now = new Date();

  const differenceInMs = now.getTime() - givenDate.getTime();
  const hoursDifference = differenceInMs / (1000 * 60 * 60); // Convert ms to hours

  return hoursDifference > hours;
}

export default isMoreThan24HoursOld;
