import 'dotenv/config'
import fs from 'fs'

let cursor = null
// const all = []
let i = 0

async function fetchClipsPage() {
  await fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=207813352&first=100${cursor ? `&after=${cursor}` : ''}`, {
    headers: {
      Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
      'Client-Id': process.env.TWITCH_CLIENT,
    }
  })
    .then(res => res.text())
    .then(res => {
      console.log(res.substring(0, 30))
      console.log(`fetched ${++i}`)
      fs.writeFileSync(`${Date.now()}.json`, res)

      cursor = JSON.parse(res).pagination?.cursor
      if (!cursor) throw new Error()
    })
}

while (true) await fetchClipsPage()
