import {Accessor, Setter} from 'solid-js'

import hardModeIcon from '../../images/hard_mode.png'
import easyModeIcon from '../../images/easy_mode.png'

import styles from './mode-switch.module.scss'

interface ModeSwitchProps {
  hardMode: Accessor<boolean>
  setHardMode: (value: boolean) => void
}

export default function ModeSwitch({hardMode, setHardMode}: ModeSwitchProps) {
  return <>
    <div class={styles.hardMode}>
      <label class={styles.label}>
        <input class={styles.input} type={'checkbox'} hidden={true}
               checked={hardMode()} onInput={e => setHardMode(e.target.checked)} />
        <div class={styles.indicatorWrapper}>
          <div class={styles.indicator} />
        </div>
        <img src={easyModeIcon} alt={'Normal Mode'} class={styles.image} />
        <img src={hardModeIcon} alt={'Hard Mode'} class={styles.image} />
      </label>
    </div>
  </>
}
