import {dateNumber, randomForDate} from './pseudo-random'
import {Step, steps, stepsFine} from './components/Slider'

import clipsDbIndexFile from '../clips-db_index.txt'
import {createResource} from 'solid-js'

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

export type ClipData = [string, string]

async function getClipForDateBase(date: Date, shift: boolean, old: boolean) {
  const clipsDbIndex = await fetch(clipsDbIndexFile).then(res => res.text())
  let clip = null, i = 0
  const clipsLength = Number(clipsDbIndex.split(' ')[0])
  const clipsPageSize = Number(clipsDbIndex.split(' ')[1])
  do {
    const clipIndex = Math.floor(randomForDate(date, i++, shift, old) * clipsLength)
    const clipsDbFile = (await import((`../clips-db_${Math.floor(clipIndex / clipsPageSize).toString().padStart(3, '0')}.txt`))).default
    const clipsDb = await fetch(clipsDbFile).then(res => res.text())
    clip = clipsDb.split('\n')[clipIndex % clipsPageSize].split(' ')
  } while (!clip)
  return clip
}

export function getClipForDate(date: Date, shift = true, old = false) {
  return getClipForDateBase(date, shift, old)
}

export function useClipsMeta() {
  return createResource(
    async () => {
      const clipsDbIndex = await fetch(clipsDbIndexFile).then(res => res.text())
      const clipsLength = Number(clipsDbIndex.split(' ')[0])
      const clipsPageSize = Number(clipsDbIndex.split(' ')[1])
      return {clipsLength, clipsPageSize}
    }
  )
}

export function useClipForDate(date: Date, shift: boolean, old: boolean) {
  const [clipsMeta] = useClipsMeta()
  return createResource(
    clipsMeta,
    async (clipsMeta) => {
      let clip = null, i = 0
      do {
        const clipIndex = Math.floor(randomForDate(date, i++, shift, old) * clipsMeta.clipsLength)
        const clipsDbFile = (await import((`../clips-db_${Math.floor(clipIndex / clipsMeta.clipsPageSize).toString().padStart(3, '0')}.txt`))).default
        const clipsDb = await fetch(clipsDbFile).then(res => res.text())
        clip = clipsDb.split('\n')[clipIndex % clipsMeta.clipsPageSize].split(' ')
      } while (!clip)
      return clip
    }
  )
}

export function useClipForToday(shift = true, old = false) {
  return useClipForDate(new Date(), shift, old)
}

export async function getClipForToday(shift = true, old = false) {
  return await getClipForDate(new Date(), shift, old)
}

export function getGuessDistance(clipDate: DateVec, step: Step) {
  const rangeStartVal = (new Date(...step.startRange)).valueOf()
  const rangeEndVal = (new Date(...step.endRange)).valueOf()
  const middle = (rangeEndVal - rangeStartVal) / 2 + rangeStartVal
  const clipDateVal = (new Date(...clipDate)).valueOf()
  const distance = Math.abs(clipDateVal - middle)
  return distance / 1000 / 60 / 60 / 24
}
