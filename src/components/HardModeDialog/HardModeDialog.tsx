import Dialog from '@corvu/dialog'
import {IoHelp, IoHelpSharp} from 'solid-icons/io'

import styles from './hard-mode-dialog.module.scss'
import hardModeImage from '../../images/hard_mode.png'

export default function HardModeDialog() {
  const initialOpen = localStorage.getItem('seen_hard_mode') !== '1'

  return <>
    <Dialog initialOpen={initialOpen} onOpenChange={open => {
      if (open) return
      localStorage.setItem('seen_hard_mode', '1')
    }}>
      <Dialog.Portal>
        <Dialog.Overlay class={styles.overlay} />
        <Dialog.Content class={styles.modal}>
          <Dialog.Close class={styles.close} />
          <h2>So you think this shit is easy?</h2>
          <small><i>(You have guessed correctly within 2 guesses on at least 3 days)</i></small>
          <h3>How about you try <img class={styles.inlineImage} src={hardModeImage} alt={'Hard Mode'} />, then</h3>
          <p>Turn it on before you make your first guess.</p>
          <p>You can set the mode for each day.</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  </>
}
