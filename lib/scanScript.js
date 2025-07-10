export async function runInstagramCheck(email) {
  return new Promise((resolve) => {
    const registered = email.includes('gmail'); // fake logic
    resolve({ registered });
  });
}
