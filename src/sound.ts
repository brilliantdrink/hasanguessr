import throttle from 'lodash.throttle'
import soundClick from './sounds/click.mp3'
import soundAffirmation1 from './sounds/ui-affirmation-1.mp3'
import soundAffirmation2 from './sounds/ui-affirmation-2.mp3'
import soundAffirmation3 from './sounds/ui-affirmation-3.mp3'
import soundType from './sounds/ui-type.mp3'
import soundCelebration from './sounds/celebration.mp3'

// @ts-ignore
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const gainNode = audioContext.createGain()
gainNode.gain.value = .15

function loadAudio(url: string) {
  return fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
}

export enum Sounds {
  Click = 'Click',
  Affirmation1 = 'Affirmation1',
  Affirmation2 = 'Affirmation2',
  Affirmation3 = 'Affirmation3',
  Type = 'Type',
  Celebration = 'Celebration',
}

const buffers = {} as Record<Sounds, AudioBuffer>
loadAudio(soundClick).then(decodedData => buffers[Sounds.Click] = decodedData)
loadAudio(soundAffirmation1).then(decodedData => buffers[Sounds.Affirmation1] = decodedData)
loadAudio(soundAffirmation2).then(decodedData => buffers[Sounds.Affirmation2] = decodedData)
loadAudio(soundAffirmation3).then(decodedData => buffers[Sounds.Affirmation3] = decodedData)
loadAudio(soundType).then(decodedData => buffers[Sounds.Type] = decodedData)
loadAudio(soundCelebration).then(decodedData => buffers[Sounds.Celebration] = decodedData)

export function playSound(sound: Sounds) {
  const audioBuffer = buffers[sound]
  audioContext.resume()
  const source = audioContext.createBufferSource()
  source.buffer = audioBuffer
  if (sound === Sounds.Click) {
    source.connect(gainNode)
    gainNode.connect(audioContext.destination)
  } else {
    source.connect(audioContext.destination)
  }
  source.start(0)
}

export const playSoundThrottled = throttle(playSound, 20)
