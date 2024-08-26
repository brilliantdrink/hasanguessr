import Dialog from '@corvu/dialog'
import {IoHelpSharp} from 'solid-icons/io'

import styles from './intro-dialog.module.scss'

export default function IntroDialog({initialOpen}: { initialOpen: boolean }) {
  return <>
    <Dialog initialOpen={initialOpen} onOpenChange={open => {
      if (open) return
      localStorage.setItem('seen_help', '1')
    }}>
      <Dialog.Trigger class={styles.trigger}>
        <IoHelpSharp aria-label={'Help'} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class={styles.overlay} />
        <Dialog.Content class={styles.modal}>
          <Dialog.Close class={styles.close} />
          <h2>How What Do?</h2>
          <h3>Prerequisites</h3>
          <ol>
            <li>Read the whole of “Das Kapital”</li>
            <li>Watch EVERY HasanAbi VOD (optional)</li>
            <li>Convert at least one person to communism / socialism</li>
          </ol>
          <h3>Gameplay</h3>
          <p>Watch the clip shown on screen.</p>
          <p>Guess the creation date of the clip by dragging the slider or using your arrow keys.</p>
          <p>Submit your answer.</p>
          <p>You have 5 guesses.</p>
          <p class={styles.emphasized}>according to your ability</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  </>
}
