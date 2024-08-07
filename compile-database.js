import fs from 'fs'

const clips = {}

fs.readdirSync('clips_meta').forEach(file => {
  if (!file.endsWith('.json')) return
  const json = JSON.parse(fs.readFileSync('clips_meta/' + file, 'utf8'))
  json.data.forEach(clip => {
    clips[clip.id] = `${clip.id} ${clip.created_at} ${clip.view_count} ${clip.game_id}`
  })
})

console.log(Object.keys(clips).length)

fs.writeFileSync('clips-db', Object.values(clips).join('\n'), 'utf8')
