import {Accessor, Setter} from 'solid-js'
import {toast} from 'solid-toast'
import {default as cn} from 'classnames'
import debounce from 'lodash.debounce'

import {playSound, Sounds} from './sound'
import celebrate from './confetti-calls'
import {Step} from './components/Slider'
import toastStyles from './toast.module.scss'
import {dateNumber} from './pseudo-random'
import {getGuessDistance, isBefore} from './utils'

interface MakeSubmitHandlerProps {
  guesses: Accessor<number[]>
  setGuesses: (value: number[]) => void
  slideValue: Accessor<number>
  clipDate: Accessor<[number, number, number] | undefined>
  setGameEnded: Setter<boolean | null>,
  steps: Accessor<Step[]>,
  hardMode: Accessor<boolean>,
}

export const makeSubmitHandler = (
  {guesses, setGuesses, slideValue, clipDate, setGameEnded, steps, hardMode}: MakeSubmitHandlerProps) =>
  function handleSubmit() {
    if (guesses().length === 0 && hardMode())
      localStorage.setItem(String(dateNumber) + '_hard_mode', JSON.stringify(true))

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

    const step = steps()[slideValue()];
    const clipDate_ = clipDate()
    if (!clipDate_) return
    if (isBefore(step.endRange, clipDate_) || isBefore(clipDate_, step.startRange)) {
      setTimeout(() => {
        const distanceDays = getGuessDistance(clipDate_, step)
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

export const makeSubmitDebouncedHandler = (props: MakeSubmitHandlerProps) => debounce(makeSubmitHandler(props), 200, {
  leading: true,
  trailing: false
})
