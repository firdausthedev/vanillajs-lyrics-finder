const searchBtn = document.getElementById('search-btn')
const searchInput = document.getElementById('search-input')

const songTitle = document.getElementById('song-title')

const modal = document.getElementById('modal')
const closeModal = document.getElementById('modal-close')
const songTitleModal = document.querySelector('#modal-form h2')
const songLyricModal = document.querySelector('#modal-form p')
const albumCoverModal = document.querySelector('#modal-title img')

const APIURL = 'https://api.lyrics.ovh'
let list = []
let currentSongID

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
  list.push(data)
  const title = data.song.title
  const albumCover = data.song.album.cover_medium
  const artist = data.song.artist.name

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

searchInput.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    getData()
  }
})

searchBtn.addEventListener('click', async (e) => {
  getData()
})

const getData = () => {
  list = []
  document.querySelectorAll('.song').forEach((song, index) => {
    song.remove()
  })

  if (isYoutubeLink(searchInput.value)) {
    getSongTitleFromYT(searchInput.value)
  } else {
    getSongData(searchInput.value)
  }
}

const getSongTitleFromYT = async (url) => {
  const res = await fetch('https://noembed.com/embed?url=' + url)
  const data = await res.json()
  getSongData(data.title)
}

const isYoutubeLink = (input) => {
  var pattern = new RegExp(
    '^(https?:\\/\\/)?' +
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
      '((\\d{1,3}\\.){3}\\d{1,3}))' +
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
      '(\\?[;&a-z\\d%_.~+=-]*)?' +
      '(\\#[-a-z\\d_]*)?$',
    'i'
  )
  return pattern.test(input)
}

document.getElementById('songs-details').addEventListener('click', (e) => {
  if (e.target.classList.contains('get-lyric')) {
    const id = e.target.parentElement.id
    displayLyrics(id)
  }
})

// get lyrics by id
const displayLyrics = (id) => {
  list.forEach((li) => {
    if (li.index == id) {
      modal.style.display = 'block'
      songTitleModal.innerHTML = li.song.title.length > 30 ? `${li.song.title.substr(0, 30)}...` : li.song.title
      songLyricModal.innerHTML = li.lyrics.lyrics.replace(/(\r\n|\r|\n)/g, '<br>')
      // albumCoverModal.src = li.song.album.cover_medium
    }
  })
}

// close button inside modal
closeModal.addEventListener('click', () => (modal.style.display = 'none'))

//close modal if click outside of modal
modal.addEventListener('click', (e) => {
  if (e.target.classList.value === 'modal-backdrop') {
    modal.style.display = 'none'
  }
})
