import {createEffect, createMemo, createSignal, onCleanup} from 'solid-js'
import {Toaster} from 'solid-toast'

import './style.scss'
import styles from './app.module.scss'

import TwitchEmbed from './components/TwitchEmbed'
import Header from './components/Header'
import Slider, {isBefore, isNotAfter, steps, stepsFine} from './components/Slider'
import Button from './components/Button'
import Signature from './components/Signature'
import Guesses from './components/Guesses'
import ModeSwitch from './components/ModeSwitch'
import HardModeDialog from './components/HardModeDialog'
import createPersistedSignal from './persistedSignal'
import {makeSubmitDebouncedHandler} from './submit-guess'
import {dateNumber, randomForDate} from './pseudo-random'

import clipsDb from '../clips-db.txt'

const previousGuesses: number[][] = []
for (var i = 0, len = localStorage.length; i < len; ++i) {
  const key = localStorage.key(i)
  if (!key || !key.endsWith('guesses')) continue
  previousGuesses.push(JSON.parse(localStorage.getItem(key) as string))
}

const wasTooGood = previousGuesses.filter(guess => guess.length <= 2).length >= 3

export default function App() {
  const [guesses, setGuesses] = createPersistedSignal<number[]>(String(dateNumber) + '_guesses', [])
  const [gameEnded, setGameEnded] = createSignal<null | boolean>(null)
  const [hardMode, setHardMode] = createPersistedSignal('hardMode', false)
  const stepsAdaptive = createMemo(() => !hardMode() ? steps : stepsFine)
  const [_slideValue, setSlideValueSilent] = createSignal<number | null>(null)
  const slideValue = createMemo(() => Math.min(stepsAdaptive().length - 1, _slideValue() ?? stepsAdaptive().length / 2))
  const helpDialogInitialOpen = createMemo(() => !localStorage.getItem('seen_help'))

  const [allClips, setAllClips] = createSignal<([string, string, string, string] | null)[]>(null!)

  createEffect(() => {
    if (allClips()) return
    fetch(clipsDb).then(res => res.text())
      .then(text =>
        text.split('\n').map(line => line.startsWith('!') ? null : line.split(' ')) as ([string, string, string, string] | null)[]
      ).then(setAllClips)
  })

  createEffect(() => {
    if (typeof gameEnded() === 'boolean' || !clipDate()) return
    if (!guesses().at(-1)) setGameEnded(false)
    else {
      const step = stepsAdaptive()[guesses().at(-1) as number]
      setGameEnded(
        (!isBefore(step.endRange, clipDate() as [number, number, number]) &&
          !isBefore(clipDate() as [number, number, number], step.startRange)) ||
        guesses().length >= 5
      )
    }
  })

  createEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'Enter') handleSubmitDebounce()
    }

    document.addEventListener('keydown', handleKeyDown)
    onCleanup(() => document.removeEventListener('keydown', handleKeyDown));
  })

  const clipData = createMemo(() => {
    if (!allClips()) return null
    let clip = null, i = 0
    do clip = allClips()[Math.floor(randomForDate(i++) * allClips()?.length)]; while (!clip)
    return clip
  })

  const clipId = createMemo(() => clipData()?.[0])
  const clipDate = createMemo(() => {
    const dateStr = clipData()?.[1]
    if (!dateStr) return undefined
    return [dateStr.substring(0, 4), dateStr.substring(5, 7), dateStr.substring(8, 10)].map(Number) as [number, number, number]
  })

  const won = createMemo(() => {
    if (!clipDate()) return false
    const lastGuess = guesses().at(-1)
    if (!lastGuess) return false
    const lastGuessStep = stepsAdaptive()[lastGuess]
    return isNotAfter(lastGuessStep.startRange, clipDate() as [number, number, number]) &&
      isNotAfter(clipDate() as [number, number, number], lastGuessStep.endRange)
  })

  const handleSubmitDebounce =
    makeSubmitDebouncedHandler({guesses, setGuesses, slideValue, clipDate, setGameEnded, steps: stepsAdaptive, hardMode})

  return <>
    {wasTooGood && <HardModeDialog/>}
    <Toaster position={'top-center'} gutter={8} />
    <Header helpDialogInitialOpen={helpDialogInitialOpen()} />
    <TwitchEmbed id={clipId} />
    <div class={styles.inputs}>
      {guesses().length === 0
        ? wasTooGood && <ModeSwitch hardMode={hardMode} setHardMode={setHardMode} />
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
