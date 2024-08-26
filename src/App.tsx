import {createEffect, createMemo, createSignal, onCleanup} from 'solid-js'
import {Toaster} from 'solid-toast'

import './style.scss'
import styles from './app.module.scss'

import TwitchEmbed from './components/TwitchEmbed'
import Header from './components/Header'
import Slider, {steps, stepsFine} from './components/Slider'
import Button from './components/Button'
import Signature from './components/Signature'
import Guesses from './components/Guesses'
import ModeSwitch from './components/ModeSwitch'
import HardModeDialog from './components/HardModeDialog'
import createPersistedSignal from './persistedSignal'
import {makeSubmitDebouncedHandler} from './submit-guess'

import {dateNumber} from './pseudo-random'
import {ClipData, DateVec, dateVecIsInStepRange, getClipForToday, timeStringToDateVec, wasTooGoodPromise} from './utils'

export default function App() {
  const [guesses, setGuesses] = createPersistedSignal<number[]>(String(dateNumber) + '_guesses', [])
  const [gameEnded, setGameEnded] = createSignal<null | boolean>(null)
  const [hardMode, setHardMode] = createPersistedSignal('hardMode', false)
  const stepsAdaptive = createMemo(() => !hardMode() ? steps : stepsFine)
  const [_slideValue, setSlideValueSilent] = createSignal<number | null>(null)
  const slideValue = createMemo(() => Math.min(stepsAdaptive().length - 1, _slideValue() ?? stepsAdaptive().length / 2))
  const helpDialogInitialOpen = createMemo(() => !localStorage.getItem('seen_help'))

  const [wasTooGood, setWasTooGood] = createSignal<boolean>(null!)

  createEffect(() => {
    if (typeof wasTooGood() === 'boolean') return
    wasTooGoodPromise.then(setWasTooGood)
  })

  createEffect(() => {
    if (typeof gameEnded() === 'boolean' || !clipDate()) return
    if (!guesses().at(-1)) setGameEnded(false)
    else {
      const step = stepsAdaptive()[guesses().at(-1) as number]
      setGameEnded(dateVecIsInStepRange(clipDate() as DateVec, step) || guesses().length >= 5)
    }
  })

  function handleKeyDown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'Enter') handleSubmitDebounce()
  }

  createEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  })

  const [clipData, setClipData] = createSignal<ClipData | null>(null)

  createEffect(() => {
    if (clipData()) return
    getClipForToday().then(setClipData)
  })

  const clipId = createMemo(() => clipData()?.[0])
  const clipDate = createMemo(() => {
    const dateStr = clipData()?.[1]
    if (!dateStr) return undefined
    return timeStringToDateVec(dateStr)
  })

  const won = createMemo(() => {
    if (!clipDate()) return false
    const lastGuess = guesses().at(-1)
    if (!lastGuess) return false
    const lastGuessStep = stepsAdaptive()[lastGuess]
    return dateVecIsInStepRange(clipDate() as DateVec, lastGuessStep)
  })

  const handleSubmitDebounce =
    makeSubmitDebouncedHandler({
      guesses, setGuesses, slideValue, clipDate, setGameEnded, steps: stepsAdaptive, hardMode
    })

  return <>
    {wasTooGood() && <HardModeDialog />}
    <Toaster position={'top-center'} gutter={8} />
    <Header helpDialogInitialOpen={helpDialogInitialOpen()} />
    <TwitchEmbed id={clipId} />
    <div class={styles.inputs}>
      {guesses().length === 0
        ? wasTooGood() && <ModeSwitch hardMode={hardMode} setHardMode={setHardMode} />
        : <Guesses guesses={guesses} clipDate={clipDate} gameEnded={gameEnded} won={won} hardMode={hardMode} />
      }
      {hardMode() && <p class={styles.monthHint}>(early: 1 - 10, mid: 11 - 20, late: 21 - 31)</p>}
      {!(gameEnded() ?? true) && <>
        <p class={styles.guessesLeft}>{5 - guesses().length} guesses left</p>
        <Slider value={slideValue} setValue={setSlideValueSilent} hardMode={hardMode} />
        <Button class={styles.button} onClick={handleSubmitDebounce}>
          guess
        </Button>
      </>}
    </div>
    <Signature class={styles.signature} classSvg={styles.signatureSvg} />
  </>
}
