import {JSX} from 'solid-js'

import styles from './button.module.scss'
import {default as cn} from 'classnames'

export default function Button(props: JSX.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} class={cn(styles.button, props.class)} />
}

