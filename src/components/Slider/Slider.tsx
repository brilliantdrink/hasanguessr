import {Accessor, createEffect, createMemo, createSignal, onCleanup, Setter} from 'solid-js'
import {default as cn} from 'classnames'
import styles from './slider.module.scss'
import {playSoundThrottled, Sounds} from '../../sound'
import {daysInMonth, getMonthName, isBefore} from '../../utils'

export interface Step {
  label: string,
  startRange: [number, number, number],
  endRange: [number, number, number],
}

const steps: Step[] = []
const stepsFine: Step[] = []
const rangeStart: [number, number, number] = [2018, 3, 23]
const rangeEnd: [number, number, number] = [2024, 8, 4]
let monthCursor = rangeStart[1]

for (let yearCursor = rangeStart[0]; yearCursor <= rangeEnd[0]; yearCursor++) {
  for (; monthCursor <= 12; monthCursor++) {
    const monthName = getMonthName(monthCursor)
    steps.push({
      label: `${monthName} ${yearCursor}`,
      startRange: [yearCursor, monthCursor, 1],
      endRange: [yearCursor, monthCursor, daysInMonth(monthCursor, yearCursor)],
    })
    const earlyEnd: [number, number, number] = [yearCursor, monthCursor, 10]
    if (isBefore(rangeStart, earlyEnd)) stepsFine.push({
      label: `early ${monthName} ${yearCursor}`,
      startRange: [yearCursor, monthCursor, 1],
      endRange: earlyEnd,
    })
    const midStart: [number, number, number] = [yearCursor, monthCursor, 11]
    const midEnd: [number, number, number] = [yearCursor, monthCursor, 20]
    if (isBefore(midStart, rangeEnd) && isBefore(rangeStart, midEnd)) stepsFine.push({
      label: `mid ${monthName} ${yearCursor}`,
      startRange: midStart,
      endRange: midEnd,
    })
    const endStart: [number, number, number] = [yearCursor, monthCursor, 21]
    if (isBefore(endStart, rangeEnd)) stepsFine.push({
      label: `late ${monthName} ${yearCursor}`,
      startRange: endStart,
      endRange: [yearCursor, monthCursor, daysInMonth(monthCursor, yearCursor)],
    })
    if (yearCursor === rangeEnd[0] && monthCursor === rangeEnd[1]) break
  }
  monthCursor = 1
}

export {steps, stepsFine}

export default function Slider({value, setValue: setValueSilent, hardMode}: {
  value: Accessor<number>,
  setValue: Setter<number | null>
  hardMode: Accessor<boolean>
}) {
  function setValue(value: number) {
    playSoundThrottled(Sounds.Click)
    setValueSilent(value)
  }

  const stepsAdaptive = createMemo(() => !hardMode() ? steps : stepsFine)

  createEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key.startsWith('Arrow')) event.preventDefault()
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setValue(Math.min(value() + 1, stepsAdaptive().length))
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setValue(Math.max(0, value() - 1))
    }

    document.addEventListener('keydown', handleKeyDown)
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  })

  return <>
    <div class={styles.value}>
      {stepsAdaptive()[value()]?.label.split(' ').map(str => <span>{str}&nbsp;</span>)}
    </div>
    <div class={styles.wrapper}>
      <div class={styles.slide} />
      <div class={cn(styles.knob, hardMode() && styles.fine)} style={{'--offset': value() / stepsAdaptive().length}}>
        <div class={styles.cog} />
        <div class={styles.hs} />
        <div class={styles.arrow} />
      </div>
      <input class={styles.rangeSelect} type={'range'} min={0} max={stepsAdaptive().length - 1} step={1} value={value()}
             onInput={e => setValue(Number(e.target.value))} />
    </div>
  </>
}
