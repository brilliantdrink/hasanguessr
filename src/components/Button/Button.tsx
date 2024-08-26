import {JSX} from 'solid-js'

import styles from './button.module.scss'
import {default as cn} from 'classnames'

export default function Button({variant, ...props}: JSX.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: 'primary' | 'secondary'}) {
  variant ??= 'primary'
  return <button {...props} class={cn(styles.button, styles[variant], props.class)} />
}

