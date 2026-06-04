export const maskString = (
  value: string,
  showStart = 3,      
  showEnd = 0,   
  maskChar = "*"
) => {
  if (!value) return "";
  const length = value.length;

  if (showStart + showEnd >= length) return value;

  const start = value.slice(0, showStart);
  const end = value.slice(length - showEnd);
  const masked = maskChar.repeat(length - showStart - showEnd);

  return `${start}${masked}${end}`;
};

export const maskEmail = (email: string) => {
  if (!email) return "";
  const [user, domain] = email.split("@");
  if (!domain) return maskString(email, 1, 0, "*");
  const maskedUser = maskString(user, 1, 0, "*");
  return `${maskedUser}@${domain}`;
};