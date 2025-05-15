import {Accessor, createMemo} from 'solid-js'
import {
  IoArrowBackCircleSharp,
  IoArrowForwardCircleSharp,
  IoCheckmarkCircleSharp,
  IoCloseCircleSharp
} from 'solid-icons/io'
import {default as cn} from 'classnames'
import {steps, stepsFine} from '../Slider'
import {IoArrowTwoHeadBackCircleSharp, IoArrowTwoHeadForwardCircleSharp} from '../icons/IoArrowTwoHeadCircleSharp'
import {DateVec, getGuessDistance, isBefore, isNotAfter} from '../../utils'

import styles from './guesses.module.scss'

interface GuessesProps {
  guesses: Accessor<number[]>
  clipDate: Accessor<DateVec | undefined>
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
        const distanceDays = clipDateVal && getGuessDistance(clipDateVal, step)
        let isCorrect = false
        if (clipDateVal && isBefore(step.endRange, clipDateVal))
          arrow = distanceDays && distanceDays < 300
            ? <IoArrowForwardCircleSharp size={'1.5rem'} />
            : <IoArrowTwoHeadForwardCircleSharp size={'1.5rem'} />
        else if (clipDateVal && isBefore(clipDateVal, step.startRange))
          arrow = distanceDays && distanceDays < 300
            ? <IoArrowBackCircleSharp size={'1.5rem'} />
            : <IoArrowTwoHeadBackCircleSharp size={'1.5rem'} />
        else {
          arrow = <IoCheckmarkCircleSharp size={'1.5rem'} />
          isCorrect = true
        }
        return (
          <div class={styles.guess}>
            {!isCorrect && clipDateVal && <small>guess {isBefore(step.endRange, clipDateVal) ? 'later' : 'earlier'}</small>}
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
