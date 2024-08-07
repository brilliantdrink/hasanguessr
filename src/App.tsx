import {createEffect, createMemo, createSignal} from 'solid-js'
import debounce from 'lodash.debounce'
import {toast, Toaster} from 'solid-toast'
import {default as cn} from 'classnames'
import {IoArrowBackCircleSharp, IoArrowForwardCircleSharp, IoCheckmarkCircleSharp} from 'solid-icons/io'
import './style.scss'
import TwitchEmbed from './components/TwitchEmbed'
import Header from './components/Header'
import Slider, {isBefore, steps} from './components/Slider'
import Button from './components/Button/Button'
import {playSound, Sounds} from './sound'
import createPersistedSignal from './persistedSignal'
import {dateNumber, randomForDate} from './pseudo-random'
import celebrate from './confetti-calls'

import styles from './app.module.scss'
import toastStyles from './toast.module.scss'

import clipsDb from '../clips-db.txt'
import Signature from './components/Signature'

export default function App() {
  const [guesses, setGuesses] = createPersistedSignal<number[]>(String(dateNumber) + '_guesses', [])
  const [gameEnded, setGameEnded] = createSignal<null | boolean>(null)
  const [slideValue, setSlideValueSilent] = createSignal(Math.floor(steps.length / 2))
  const helpDialogInitialOpen = createMemo(() => !localStorage.getItem('seen_help'))

  const [allClips, setAllClips] = createSignal<([string, string, string, string] | null)[]>(null!)

  createEffect(() => {
    if (allClips()) return
    fetch(clipsDb)
      .then(res => res.text())
      .then(text => text
        .split('\n')
        .map(line => line.startsWith('!') ? null : line.split(' ')) as ([string, string, string, string] | null)[]
      )
      .then(setAllClips)
  })

  createEffect(() => {
    if (typeof gameEnded() === 'boolean' || !clipDate()) return
    if (!guesses().at(-1)) setGameEnded(false)
    else {
      const step = steps[guesses().at(-1) as number]
      setGameEnded(
        (!isBefore(step.endRange, clipDate() as [number, number, number]) &&
          !isBefore(clipDate() as [number, number, number], step.startRange)) ||
        guesses().length >= 5
      )
    }
  })

  function handleSubmit() {
    playSound(Sounds.Type)
    if (guesses().includes(slideValue())) {
      toast.custom((t) => (
        <div class={cn(toastStyles.toast, t.visible ? toastStyles.open : toastStyles.close)}>
          <p>Already guessed</p>
        </div>
      ))
      return
    }
    setGuesses([...guesses(), slideValue()])

    const step = steps[slideValue()]
    const clipDate_ = clipDate()
    if (!clipDate_) return
    if (isBefore(step.endRange, clipDate_) || isBefore(clipDate_, step.startRange)) {
      const rangeStartVal = (new Date(...step.startRange)).valueOf()
      const rangeEndVal = (new Date(...step.endRange)).valueOf()
      const middle = (rangeEndVal - rangeStartVal) / 2 + rangeStartVal
      const clipDateVal = (new Date(...clipDate_)).valueOf()
      const distance = Math.abs(clipDateVal - middle)
      const distanceDays = distance / 1000 / 60 / 60 / 24
      setTimeout(() => {
        if (distanceDays < 300) playSound(Sounds.Affirmation2)
        else playSound(Sounds.Affirmation1)
      }, 100)
      if (guesses().length === 5) setGameEnded(true)
    } else {
      setTimeout(() => {
        playSound(Sounds.Affirmation3)
      }, 100)
      setTimeout(() => {
        celebrate()
        playSound(Sounds.Celebration)
      }, 400)
      setGameEnded(true)
    }
  }

  const clipData = createMemo(() => {
    if (!allClips()) return null
    let clip = null, i = 0
    do {
      const index = Math.floor(randomForDate(i) * allClips()?.length)
      clip = allClips()[index]
      i++
    } while (!clip)
    return clip
  })

  const clipId = createMemo(() => clipData()?.[0])
  const clipDate = createMemo(() => {
    const dateStr = clipData()?.[1]
    if (!dateStr) return undefined
    return [dateStr.substring(0, 4), dateStr.substring(5, 7), dateStr.substring(8, 10)].map(Number) as [number, number, number]
  })

  return <>
    <Toaster position={'top-center'} gutter={8} />
    <Header helpDialogInitialOpen={helpDialogInitialOpen()} />
    <TwitchEmbed id={clipId} />
    <div class={styles.inputs}>
      {/*<p class={styles.monthHint}>(early: 1 - 10, mid: 11 - 20, late: 21 - 31)</p>*/}
      <div class={styles.guesses}>
        {guesses().map(stepIndex => {
          const step = steps[stepIndex]
          const clipDateVal = clipDate()
          let arrow
          if (clipDateVal && isBefore(step.endRange, clipDateVal))
            arrow = <IoArrowForwardCircleSharp size={'1.5rem'} />
          else if (clipDateVal && isBefore(clipDateVal, step.startRange))
            arrow = <IoArrowBackCircleSharp size={'1.5rem'} />
          else
            arrow = <IoCheckmarkCircleSharp size={'1.5rem'} />
          return (
            <div class={styles.guess}>
              <span>{step.label}</span>
              {arrow}
            </div>
          )
        })}
      </div>
      {!(gameEnded() ?? true) &&
        <>
          <p class={styles.guessesLeft}>{5 - guesses().length} guesses left</p>
          <Slider value={slideValue} setValue={setSlideValueSilent} />
          <Button class={styles.button} onClick={debounce(handleSubmit, 200, {leading: true, trailing: false})}>
            guess
          </Button>
        </>
      }
    </div>
    <Signature class={styles.signature} classSvg={styles.signatureSvg}/>
  </>
}
