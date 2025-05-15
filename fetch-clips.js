import 'dotenv/config'
import fs from 'fs'

// let cursor = 'eyJiIjpudWxsLCJhIjp7IkN1cnNvciI6Ik1qWTROREE9In19'
let cursor = null
// const all = []
let i = 0

const today = new Date();
today.setHours(0, 0, 0)

const date = new Date(2024, 7, 1)
today.setHours(0, 0, 0)

async function fetchClipsPage() {
  const nextDay = new Date(date.valueOf())
  nextDay.setDate(nextDay.getDate() + 1)
  await fetch(`https://api.twitch.tv/helix/clips?broadcaster_id=207813352&started_at=${date.toISOString()}&ended_at=${nextDay.toISOString()}&first=100${cursor ? `&after=${cursor}` : ''}`, {
    headers: {
      Authorization: `Bearer ${process.env.TWITCH_TOKEN}`,
      'Client-Id': process.env.TWITCH_CLIENT,
    }
  })
    .then(res => res.text())
    .then(res => {
      console.log(res.substring(0, 30))
      console.log(`fetched ${date.toLocaleDateString('en-GB')} ${++i}`)
      fs.writeFileSync(`${Date.now()}.json`, res)

      cursor = JSON.parse(res).pagination?.cursor
    })
}

while (true) {
  if (date.valueOf() >= today.valueOf()) break
  await fetchClipsPage()
  if (!cursor) date.setDate(date.getDate() + 1)
}
