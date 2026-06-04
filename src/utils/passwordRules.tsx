export const passwordRules = [
    {
      label: "At least 8 characters",
      test: (val: string) => val.length >= 8,
    },
    {
      label: "At least one uppercase letter",
      test: (val: string) => /[A-Z]/.test(val),
    },
    {
      label: "At least one number",
      test: (val: string) => /\d/.test(val),
    },
    {
      label: "At least one special character",
      test: (val: string) => /[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\;/]/.test(val),
    },
    {
      label: "No sequential numbers (e.g., 1234)",
      test: (val: string) => !/012|123|234|345|456|567|678|789/.test(val),
    },
];  