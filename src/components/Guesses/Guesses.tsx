import {Accessor, createMemo} from 'solid-js'
import {
  IoArrowBackCircleSharp,
  IoArrowForwardCircleSharp,
  IoCheckmarkCircleSharp,
  IoCloseCircleSharp
} from 'solid-icons/io'
import {default as cn} from 'classnames'
import {isBefore, isNotAfter, steps, stepsFine} from '../Slider'

import styles from './guesses.module.scss'

interface GuessesProps {
  guesses: Accessor<number[]>
  clipDate: Accessor<[number, number, number] | undefined>
  won: Accessor<boolean>
  gameEnded: Accessor<boolean | null>
  hardMode: Accessor<boolean>
}

export default function Guesses({guesses, clipDate, won, gameEnded, hardMode}: GuessesProps) {
  const stepsAdaptive = createMemo(() => !hardMode() ? steps : stepsFine)
  return <>
    <div class={styles.guesses}>
      {guesses().map(stepIndex => {
        const step = stepsAdaptive()[stepIndex]
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
      {(gameEnded() ?? true) && clipDate() && !won() && <>
        <div class={cn(styles.guess, styles.answer)}>
          <span>{
            stepsAdaptive()
              .find(step =>
                isNotAfter(step.startRange, clipDate() as [number, number, number]) &&
                isNotAfter(clipDate() as [number, number, number], step.endRange)
              )?.label
          }</span>
          <IoCloseCircleSharp size={'1.5rem'} />
        </div>
      </>}
    </div>
  </>
}