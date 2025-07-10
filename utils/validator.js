export default function validateEmail(email) {
  const regex = /^[\\w.-]+@[\\w.-]+\\.\\w{2,}$/;
  return regex.test(email);
}
