import fs from 'fs'

const clips = []

fs.readdirSync('clips_meta').forEach(file => {
  if (!file.endsWith('.json')) return
  const json = JSON.parse(fs.readFileSync('clips_meta/' + file, 'utf8'))
  json.data.forEach(clip => {
    if (clip.title.toLowerCase().includes('crenshaw')) {
      clips.push(clip)
    }
  })
})

console.log(Array.from(new Set(clips.map(clip => clip.url))).join('\n'))
