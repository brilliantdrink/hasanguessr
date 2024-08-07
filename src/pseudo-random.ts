export function lcg(a: number, c: number, m: number, seed: number) {
  const state = (a * seed + c) % m
  return state / m
}

const a = 1664525 // Multiplier
const c = 1013904223 // Increment
const m = 2 ** 32 // Modulus

const currentDate = new Date()
currentDate.setDate(currentDate.getDate() + 5)
export const dateNumber = Number(String(currentDate.getDate()) + String(currentDate.getMonth()) + String(currentDate.getFullYear())) * 200

export const randomForDate = (iter: number) => lcg(a, c, m, Number(iter + String(dateNumber)))
