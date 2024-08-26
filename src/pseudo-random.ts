export function lcg(a: number, c: number, m: number, seed: number) {
  const state = (a * seed + c) % m
  return state / m
}

const a = 1664525 // Multiplier
const c = 1013904223 // Increment
const m = 2 ** 32 // Modulus

const currentDate = new Date()
currentDate.setDate(currentDate.getDate() + 5) // why tf did I do this????
export const dateNumber = Number(
  String(currentDate.getDate()).padStart(2, '0') +
  String(currentDate.getMonth()).padStart(2, '0') +
  String(currentDate.getFullYear())
) * 200

export const randomForToday = (iter: number) => lcg(a, c, m, Number(iter + String(dateNumber)))
export const randomForDate = (date: Date, iter: number, shift = true, old = false) => {
  if (shift) date.setDate(date.getDate() + 5)
  const numberString = old
    ? String(date.getDate()) + String(date.getMonth()) + String(date.getFullYear())
    : String(date.getDate()).padStart(2, '0') + String(date.getMonth()).padStart(2, '0') + String(date.getFullYear())
  const dateNumber = Number(numberString) * 200
  return lcg(a, c, m, Number(iter + String(dateNumber)))
}
