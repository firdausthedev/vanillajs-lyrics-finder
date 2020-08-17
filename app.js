const searchBtn = document.getElementById('search-btn')
const searchInput = document.getElementById('search-input')

const songTitle = document.getElementById('song-title')

const APIURL = 'https://api.lyrics.ovh'
let list = []

searchBtn.addEventListener('click', (e) => {
  document.querySelectorAll('.song').forEach((song, index) => {
    song.remove()
  })
  getSongData(searchInput.value)
})

const getSongData = async (name) => {
  const res = await fetch(`${APIURL}/suggest/${name}`)
  const data = await res.json()

  data.data.forEach(async (d, i) => {
    const artist = d.artist.name
    const title = d.title
    const withLyrics = await fetch(`${APIURL}/v1/${artist}/${title}`)
    const dataLyrics = await withLyrics.json()
    if (dataLyrics.lyrics) {
      getSongLyrics({ lyrics: dataLyrics, song: d, index: i })
    }
  })
}

const getSongLyrics = (data) => {
  const lyrics = data.lyrics.lyrics.replace(/(\r\n|\r|\n)/g, '<br>')
  const title = data.song.title
  const albumCover = data.song.album.cover_medium
  const artist = data.song.artist.name
  console.log(data)

  const baseSong = document.createElement('div')
  baseSong.className = 'song'
  baseSong.id = data.index
  baseSong.innerHTML = `
  <div class="song-info">
    <img src=${albumCover} alt="album-cover" />
    <div class="album-details">
      <p>${title}</p>
      <p>${artist}</p>
    </div>
  </div>
  <button class="get-lyric">Lyrics</button>
  
  `

  document.querySelector('#songs-details').appendChild(baseSong)
}
