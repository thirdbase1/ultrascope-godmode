export function isValidEmail(email) {
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return basicRegex.test(email);
}
