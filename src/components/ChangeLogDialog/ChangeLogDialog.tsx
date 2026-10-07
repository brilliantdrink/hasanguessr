import {Accessor, createSignal, onMount, Setter, Show} from 'solid-js'
import Dialog from '@corvu/dialog'
import cn from 'classnames'

import styles from './change-log-dialog.module.scss'

declare const VERSION: string

const HINT_DURATION: number = 1000 * 12

interface ChangeLogDialogProps {
  open: Accessor<boolean>
  setOpen: Setter<boolean>
}

export default function ChangeLogDialog(props: ChangeLogDialogProps) {
  const initialOpen = localStorage.getItem('seen_help') && localStorage.getItem('last_version_seen') !== VERSION

  const [showHint, setShowHint] = createSignal(initialOpen)
  const [timer, setTimer] = createSignal(100)
  const [hide, setHide] = createSignal(false)
  const [startedSeeing] = createSignal(Date.now())

  onMount(() => {
    if (!localStorage.getItem('seen_help')) {
      localStorage.setItem('last_version_seen', VERSION)
    } else {
      const interval = setInterval(() => {
        const newTime = 100 - (100 * (Date.now() - startedSeeing()) / HINT_DURATION)
        setTimer(newTime)
        if (newTime <= 0) {
          clearInterval(interval)
          setShowHint(false)
          localStorage.setItem('last_version_seen', VERSION)
        }
        const timeLeft = HINT_DURATION - (Date.now() - startedSeeing())
        if (timeLeft <= 200) {
          setHide(true)
        }
      })
    }
  })

  return <>
    <Show when={showHint()}>
      <div class={cn(styles.hint, hide() && styles.hide)} onClick={() => {
        props.setOpen(true)
        setShowHint(false)
      }}>
        <progress class={styles.timer} max={100} value={timer()} />
        <p class={styles.topline}>UGHH, FINALLY!</p>
        <p class={styles.headline}>More clips added</p>
        {/*<small>Click to see more changes.</small>*/}
      </div>
    </Show>
    <Dialog onOpenChange={open => {
      props.setOpen(open)
      if (open) return
      localStorage.setItem('last_version_seen', VERSION)
    }} open={props.open()}>
      <Dialog.Portal>
        <Dialog.Overlay class={styles.overlay} />
        <Dialog.Content class={styles.modal}>
          <Dialog.Close class={styles.close} />
          <h2>New update!</h2>
          <h3>More clips!</h3>
          <p>New clips up until early October 2026 have been added to the list.</p>
          <hr />
          <p>Added a fallback mechanism for deleted clips. (Will now always show an existing clip)</p>
          <p>Minor bugfixes.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  </>
}
