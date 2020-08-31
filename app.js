const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('search-input');
const songTitle = document.getElementById('song-title');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('modal-close');
const songTitleModal = document.querySelector('#modal-form h2');
const songLyricModal = document.querySelector('#modal-form p');
const songDetails = document.getElementById('songs-details');

const APIURL = 'https://api.lyrics.ovh';
let list = [];

// get the data from search input and checks whether it's a YT link or song name
const setDataFromInput = () => {
  // reset the UI
  document.querySelector('.error-msg p').innerHTML = '';
  list = [];
  document.querySelectorAll('.song').forEach(song => {
    song.remove();
  });

  const userInput = searchInput.value;
  if (isLink(userInput)) {
    const youtubeSongTitle = getSongTitleFromYT(userInput);

    youtubeSongTitle
      .then(data => {
        if (data.title === undefined) {
          displayNoMatch(userInput);
        } else {
          getSongData(data.title);
        }
      })
      .catch(err => {
        console.log(err);
        displayNoMatch(userInput);
      });
  } else {
    getSongData(userInput);
  }
};

// regex expression to check if search input is a YT link
const isLink = input => {
  var pattern = /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/;

  return pattern.test(input);
};
// get the video title from YT
const getSongTitleFromYT = async url => {
  const res = await fetch('https://noembed.com/embed?url=' + url);
  const data = await res.json();
  return data;
};

//sets the song with lyrics to the UI
const getSongData = async name => {
  let newName = refineUserSearch(name);
  const songSuggestionData = getSongSuggestionsData(newName);

  songSuggestionData.then(data => {
    if (data.data.length === 0) {
      refineYTSong(newName);
    }

    data.data.forEach(async (d, i) => {
      const artist = d.artist.name;
      const title = d.title;

      const dataLyrics = getSingleSong(artist, title);
      dataLyrics
        .then(dataLyric => {
          if (dataLyric.lyrics) {
            createSongElements({ lyrics: dataLyric, song: d, index: i });
          }
          if (data.data[i + 1] === undefined) {
            if (list.length === 0) {
              displayNoMatch(newName);
            }
          }
        })
        .catch(error => {
          console.log('single data error:', error);
          if (data.data[i + 1] === undefined) {
            if (list.length === 0) {
              displayNoMatch(newName);
            }
          }
        });
    });
  });
};

// get single song data
const getSingleSong = async (artist, title) => {
  try {
    const withLyrics = await fetch(`${APIURL}/v1/${artist}/${title}`);
    const dataLyrics = await withLyrics.json();
    return dataLyrics;
  } catch (error) {
    console.log(error);
  }
};

// get songs suggestion data
const getSongSuggestionsData = async song => {
  const res = await fetch(`${APIURL}/suggest/${song}`);
  const data = await res.json();
  return data;
};

// remove special characters that will break the query
const refineUserSearch = input => {
  let newInput = input;
  if (input.includes('ʻ')) {
    newInput = input.replace('ʻ', ' ');
  }
  if (input.includes(' – ')) {
    newInput = input.replace(' – ', ' ');
  }
  return newInput;
};
// remove some strings from youtube title and search with the new string
const refineYTSong = async title => {
  let newTitle = title.toLowerCase();
  var baddies = [
    '[dubstep]',
    '[electro]',
    '[edm]',
    '[house music]',
    '[glitch hop]',
    '[video]',
    '[official video]',
    '(official video)',
    'video',
    '/official video',
    'offical video',
    ' music ',
    '(official music video)',
    '(lyrics)',
    'music video',
    '[ official video ]',
    '[official music video]',
    '[free download]',
    '[free dl]',
    '( 1080p )',
    '(with lyrics)',
    '(high res / official video)',
    '(music video)',
    '[music video]',
    '[hd]',
    '(hd)',
    '[hq]',
    '(hq)',
    '(original mix)',
    '[original mix]',
    '[lyrics]',
    '[free]',
    '[trap]',
    '[monstercat release]',
    '[monstercat freebie]',
    '[monstercat]',
    '[edm.com premeire]',
    '[edm.com exclusive]',
    '[enm release]',
    '[free download!]',
    '[monstercat free release]',
    ' by',
    ' (',
    ') ',
    ')',
    ' from ',
    '“',
    '”',
    '  ',
    '   ',
    '"',
    '"',
    'official',
    ' - ',
    ' -',
    '- ',
  ];

  baddies.forEach(function (token) {
    newTitle = newTitle.replace(token + ' - ', '').trim();
    newTitle = newTitle.replace(token, ' ').trim();
  });

  const newRefinedData = getSongSuggestionsData(newTitle);
  newRefinedData
    .then(data => {
      if (data.data.length > 0) {
        getSongData(newTitle);
      } else {
        displayNoMatch(title);
      }
    })
    .catch(error => console.log(error));
};

// display message if no match is found
const displayNoMatch = msg => {
  document.querySelector('.error-msg p').innerHTML = `Could not find any lyrics with ${msg}`;
};

const createSongElements = data => {
  list.push(data);
  const title = data.song.title;
  const albumCover = data.song.album.cover_small;
  const artist = data.song.artist.name;

  const baseSong = document.createElement('div');
  baseSong.className = 'song';
  baseSong.id = data.index;
  baseSong.innerHTML = `
  <div class="song-info">
    <img src=${albumCover} alt="album-cover" />
    <div class="album-details">
      <p>${title}</p>
      <p>${artist}</p>
    </div>
  </div>
  <button class="get-lyric">Lyrics</button>
  
  `;
  document.querySelector('#songs-details').appendChild(baseSong);
};

// get lyrics by id
const displayLyrics = id => {
  list.forEach(li => {
    if (li.index == id) {
      closeModal.style.display = 'none';
      modal.style.display = 'block';
      songTitleModal.innerHTML = li.song.title.length > 30 ? `${li.song.title.substr(0, 30)}...` : li.song.title;
      songLyricModal.innerHTML = li.lyrics.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');
      // albumCoverModal.src = li.song.album.cover_medium
    }
  });
};

// ======================= Event Listeners ==================================
closeModal.addEventListener('click', () => (modal.style.display = 'none'));

modal.addEventListener('click', e => {
  if (e.target.classList.value === 'modal-backdrop') {
    modal.style.display = 'none';
  }
});

songDetails.addEventListener('click', e => {
  if (e.target.classList.contains('get-lyric')) {
    const id = e.target.parentElement.id;
    displayLyrics(id);
  }
});

searchInput.addEventListener('keyup', e => {
  if (e.keyCode === 13) {
    setDataFromInput();
  }
});

searchBtn.addEventListener('click', e => {
  setDataFromInput();
});
