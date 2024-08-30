import {dateNumber, randomForDate} from './pseudo-random'
import {Step, steps, stepsFine} from './components/Slider'

import clipsDb from '../clips-db.txt'

export function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate()
}

export type DateVec = [number, number, number]

export function timeStringToDateVec(timeString: string) {
  return [timeString.substring(0, 4), timeString.substring(5, 7), timeString.substring(8, 10)].map(Number) as DateVec
}

export function isBefore(a: DateVec, b: DateVec): boolean {
  if (a[0] < b[0]) return true
  else if (a[0] === b[0] && a[1] < b[1]) return true
  else if (a[0] === b[0] && a[1] === b[1] && a[2] < b[2]) return true
  return false
}

export function isNotAfter(a: DateVec, b: DateVec): boolean {
  return isBefore(a, b) || (a[0] === b[0] && a[1] === b[1] && a[2] === b[2])
}

export function dateVecIsInStepRange(dateVec: DateVec, step: Step) {
  return isNotAfter(step.startRange, dateVec) && isNotAfter(dateVec, step.endRange)
}

const formatMonthIntl = new Intl.DateTimeFormat('en-US', {month: 'long'}).format

export function getMonthName(month: number) {
  const date = new Date()
  date.setDate(1)
  date.setMonth(month - 1)
  return formatMonthIntl(date)
}

export function parseDateNumber(number: string /* lol */) {
  let numberString = String(Number(number) / 200)
  // this only happened for 8.8.2024 - 12.8.2024
  if (numberString.length === 6) numberString = '0' + numberString
  if (numberString.length === 7) numberString = numberString.substring(0, 2) + '0' + numberString.substring(2)

  return new Date(Number(numberString.substring(4)), Number(numberString.substring(2, 4)), Number(numberString.substring(0, 2)))
}

let clipSync: ([string, string, string, string] | null)[]
export const clips = fetch(clipsDb)
  .then(res => res.text())
  .then(text =>
    text.split('\n')
      .map(line => line.startsWith('!')
        ? null
        : line.split(' ') /* todo do this later */
      ) as ([string, string, string, string] | null)[]
  )
  .then(clips => {
    clipSync = clips
    return clips
  })

export type ClipData = [string, string, string, string]

function getClipForDateBase(date: Date, shift: boolean, clips: (ClipData | null)[], old: boolean) {
  let clip = null, i = 0
  const clipsLength = clips.length
  do {
    const clipIndex = Math.floor(randomForDate(date, i++, shift, old) * clipsLength)
    clip = clips[clipIndex]
  } while (!clip)
  return clip
}

export async function getClipForDate(date: Date, shift = true, old = false) {
  return getClipForDateBase(date, shift, await clips, old)
}

export function getClipForDateSync(date: Date, shift = true, old = false) {
  return clipSync ? getClipForDateBase(date, shift, clipSync, old) : null
}

export async function getClipForToday(shift = true, old = false) {
  return await getClipForDate(new Date(), shift, old)
}

export function getClipForTodaySync(shift = true, old = false) {
  return getClipForDateSync(new Date(), shift, old)
}

let setWasTooGood: (value: boolean) => void
export const wasTooGoodPromise = new Promise<boolean>(res => setWasTooGood = res)

let previousCorrectGuessesAmount = 0

const digitRegex = /\d+/

clips.then(() => {
  for (let i = 0, len = localStorage.length; i < len; ++i) {
    const key = localStorage.key(i)
    if (!key || !key.endsWith('guesses') || key.startsWith(String(dateNumber))) continue
    const guess = JSON.parse(localStorage.getItem(key) as string)
    if (guess.length > 2) continue
    const thenDateNumberVal = (key.match(digitRegex) as RegExpMatchArray)[0]
    const thenDate = parseDateNumber(thenDateNumberVal)
    const hardMode = localStorage.getItem(thenDateNumberVal + '_hard_mode') ?? false
    const clip = getClipForDateSync(thenDate, false) as ClipData
    const clipOld = getClipForDateSync(thenDate, false, true) as ClipData
    const lastGuessOfDate = (!hardMode ? steps : stepsFine)[guess.at(-1)]
    const dateStr = clip[1]
    const dateStrOld = clipOld[1]
    if (!dateStr && !dateStrOld) return undefined
    const clipDate = timeStringToDateVec(dateStr)
    const clipDateOld = timeStringToDateVec(dateStrOld)
    const guessCorrect = dateVecIsInStepRange(clipDate, lastGuessOfDate)
    const guessOldCorrect = dateVecIsInStepRange(clipDateOld, lastGuessOfDate)
    if (guessCorrect || guessOldCorrect) previousCorrectGuessesAmount++
    if (previousCorrectGuessesAmount >= 3) {
      setWasTooGood(true)
      break
    }
  }
})

export function getGuessDistance(clipDate: DateVec, step: Step) {
  const rangeStartVal = (new Date(...step.startRange)).valueOf()
  const rangeEndVal = (new Date(...step.endRange)).valueOf()
  const middle = (rangeEndVal - rangeStartVal) / 2 + rangeStartVal
  const clipDateVal = (new Date(...clipDate)).valueOf()
  const distance = Math.abs(clipDateVal - middle)
  return distance / 1000 / 60 / 60 / 24
}
