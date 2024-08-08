import styles from './twitch-embed.module.scss'
import {Accessor, createSignal} from 'solid-js'
import Button from '../Button/Button'
import createPersistedSignal from '../../persistedSignal'
import {ImCheckmark} from 'solid-icons/im'

const getEmbedUrl = (id: string) => `https://clips.twitch.tv/embed?clip=${id}&parent=${window.location.host}`

export default function TwitchEmbed({id}: { id: Accessor<string | undefined> }) {
  const [showWarningPersisted, setShowWarningPersisted] = createPersistedSignal('warn_clips_tos', true)
  const [showWarning, setShowWarning] = createSignal(true)
  const [input, setInput] = createSignal(false)

  return <>
    <div class={styles.wrapper}>
      <div class={styles.blocker}>
        <span>
          Don't see anything?<br />
          Allow clips.twitch.tv and assets.twitch.tv in your ad blocker.
        </span>
      </div>
      {!id() ? null :
        <iframe src={getEmbedUrl(id() as string)} allowfullscreen={true} class={styles.player} />
      }
      {showWarning() && showWarningPersisted() &&
        <div class={styles.warning}>
          <h2>Beware, Comrade!</h2>
          <p>
            Due to the length of the list of clips (95K+), it is impossible to check if every single one is TOS
            friendly.
            Please check yourself before showing on stream!
          </p>
          <label>
            <input class={styles.check} type={'checkbox'}
                   onChange={(e) => setInput(Boolean(e.target.checked))} />
            <ImCheckmark class={styles.checkmark} />
            <span>Do not show again</span>
          </label>
          <Button class={styles.button} onClick={() => {
            setShowWarningPersisted(!input())
            setShowWarning(false)
          }}>
            Okay
          </Button>
        </div>
      }
    </div>
  </>
}

