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
import ChangeLogDialog from './components/ChangeLogDialog'
import createPersistedSignal from './persistedSignal'
import {makeSubmitDebouncedHandler} from './submit-guess'

import {dateNumber} from './pseudo-random'
import {DateVec, dateVecIsInStepRange, isBefore, timeStringToDateVec, useClipForToday} from './utils'

export default function App() {
  const [guesses, setGuesses] = createPersistedSignal<number[]>(String(dateNumber) + '_guesses', [])
  const [gameEnded, setGameEnded] = createSignal<null | boolean>(null)
  const [hardMode, setHardMode] = createPersistedSignal('hardMode', false)
  const stepsAdaptive = createMemo(() => !hardMode() ? steps : stepsFine)
  const [_slideValue, _setSlideValueSilent] = createSignal<number | null>(null)
  const slideValue = createMemo(() => Math.min(stepsAdaptive().length - 1, Math.round((_slideValue() ?? (1 / 2)) * stepsAdaptive().length)))
  const helpDialogInitialOpen = createMemo(() => !localStorage.getItem('seen_help'))

  function setSlideValueSilent(update: number | null | ((oldValue: number | null) => number | null)) {
    let newValue: number | null
    if (typeof update === 'function') {
      const oldValue: number | null = _slideValue()
      newValue = update(oldValue !== null ? Math.round(oldValue * stepsAdaptive().length) : null)
    } else newValue = update ? (update / stepsAdaptive().length) : null
    _setSlideValueSilent(newValue)
  }

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

  const [clipData] = useClipForToday()

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

  const [changeLogOpen, setChangeLogOpen] = createSignal(false)

  const share = createMemo(() => {
    if (!gameEnded()) return null
    const clipDateVal = clipDate()
    const lastGuess = stepsAdaptive().at(-1)
    if (!clipDateVal || !lastGuess) return null
    let guessesAmount = String(guesses().length)
    let guessedCorrect = false
    let emojiString = guesses().map(stepIndex => {
      const step = stepsAdaptive()[stepIndex]
      if (isBefore(step.endRange, clipDateVal)) return '➡️'
      else if (isBefore(clipDateVal, step.startRange)) return '⬅️'
      else {
        guessedCorrect = true
        return '✅'
      }
    }).join(' ')
    if (!guessedCorrect) {
      emojiString += ' ❌'
      guessesAmount = 'X'
    }
    const date = new Date().toLocaleDateString('en', {dateStyle: 'short'})
    return `HasanGuessr ${date} - ${guessesAmount}/5 ${hardMode() ? '[hard mode]' : ''} ${emojiString}`
  })

  const [showCopyConfirmation, setShowCopyConfirmation] = createSignal(false)

  return <>
    <ChangeLogDialog open={changeLogOpen} setOpen={setChangeLogOpen} />
    <Toaster position={'top-center'} gutter={8} />
    <Header helpDialogInitialOpen={helpDialogInitialOpen()} />
    <TwitchEmbed id={clipId} />
    <div class={styles.inputs}>
      {guesses().length === 0
        ? <ModeSwitch hardMode={hardMode} setHardMode={setHardMode} />
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
      {gameEnded() && <>
        <p>Share your result!</p>
        <div class={styles.share}>
          <div class={styles.text}>{share()}</div>
          <Button variant={'primary'} class={styles.button}
                  onClick={() =>
                    navigator.clipboard.writeText(share() ?? '')
                      .then(() => {
                        setShowCopyConfirmation(false)
                        setShowCopyConfirmation(true)
                      })
                      .catch(() => 0)
          }>
            Copy
          </Button>
          {showCopyConfirmation() && <div class={styles.confirmation}>Copied to clipboard!</div>}
        </div>
      </>}
    </div>
    <Signature class={styles.signature} classSvg={styles.signatureSvg} openChangeLog={() => setChangeLogOpen(true)} />
  </>
}
