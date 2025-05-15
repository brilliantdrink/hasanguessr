import fs from 'fs'

const PAGE_SIZE = 10_000
const clips = {}
const clipsData = {}
const vods = {}

fs.readdirSync('vods_meta').forEach(file => {
  if (!file.endsWith('.json')) return
  const json = JSON.parse(fs.readFileSync('vods_meta/' + file, 'utf8'))
  'data' in json && json.data.forEach(vod => {
    if (vod.view_count < 12) return
    vods[vod.id] = vod
  })
})

const datesAmounts = {}

fs.readdirSync('clips_meta', {recursive: true}).forEach(file => {
  if (!file.endsWith('.json')) return
  // if (file.startsWith('additional')) return
  // if (file.startsWith('aug-sep-oct-24')) return
  const json = JSON.parse(fs.readFileSync('clips_meta/' + file, 'utf8'))
  'data' in json && json.data.forEach(clip => {
    if (clip.view_count < 12) return
    let created = clip.created_at
    if (clip.video_id in vods) {
      created = vods[clip.video_id].created_at
    } else {
      clipsData[clip.id]?.forEach(clipData => {
        if (clipData.video_id in vods)
          created ??= vods[clipData.video_id].created_at
      })
    }
    const createdDate = new Date(created)
    createdDate.setHours(0, 0, 0)
    if (datesAmounts[createdDate.valueOf()] >= 200) return
    clipsData[clip.id] ??= []
    clipsData[clip.id].push(clip)
    clips[clip.id] = `${clip.id} ${created}`
    datesAmounts[createdDate.valueOf()] ??= 0
    datesAmounts[createdDate.valueOf()] += 1
  })
})

for (let i = 0; i < Math.ceil(Object.keys(clips).length / PAGE_SIZE); i++) {
  fs.writeFileSync(
    `clips-db_${i.toString().padStart(3, '0')}.txt`,
    Object.values(clips).slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE).join('\n'),
    'utf8'
  )
}
// console.log(Object.keys(clips).length)

/*Array.from(Object.entries(datesAmounts)).sort(([,a], [,b]) => Number(a) - Number(b)).forEach(([timestamp, amount]) => {
  console.log(new Date(Number(timestamp)), amount)
})*/

fs.writeFileSync('clips-db_index.txt', `${Object.keys(clips).length} ${PAGE_SIZE}`, 'utf8')
