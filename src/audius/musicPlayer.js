/*
 *
 * Handles Getting Audius call and updating visuals of music tab in sidebar
 *
 */

import { setAlertModal } from "../scenes/scripts/alert";
import { checkOnline } from "../scenes/scripts/tools";


const headers = {
  Accept: "application/json",
};

/* GLOBAL VARIABLES */
var playlist = [],
  playlistLoaded = false,
  playlistData,
  playlistIndex = 0,
  audius,
  trackCount = 0,
  isClicking = false,
  triggerCount = 0;

/**
 * resets trigger count
 */
export function resetCount() {
  triggerCount = 0;
}

/**
 * Creates animating elements for loading
 * @param {Phaser.Scene} scene
 */
function startLoading(scene) {
  const triangles =
    scene.sidebar.parent.ownerDocument.querySelectorAll(".triangle");
  const template = `<svg class="triangle-svg" viewBox="0 0 140 141">
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <polygon class="triangle-polygon"  points="70 6 136 138 4 138"></polygon>
      </g>
    </svg>`;
  triangles.forEach(function (triangle) {
    triangle.innerHTML = template;
  });
}

/**
 * Hides the loading animation elements
 * @param {Phaser.Scene} scene
 */
function loadingOff(scene) {
  // get elements
  var loading = scene.sidebar.getChildByID("loading");
  var triangleWrapper = scene.sidebar.getChildByID("triangle-wrapper");
  var aLogo = scene.sidebar.getChildByID("aLogo");
  var trackImg = scene.sidebar.getChildByID("trackImg");
  // hide all elements
  if (loading.style.display !== "none") {
    loading.setAttribute("style", "display: none");
  }
  if (!triangleWrapper.classList.contains("hidden")) {
    triangleWrapper.classList.toggle("hidden");
  }
  if (!aLogo.classList.contains("hidden")) {
    aLogo.classList.toggle("hidden");
  }
  // unhide the image that the loading animation was placeholding
  trackImg.classList.toggle("hidden");
}

/**
 * Sets the onclick events of the scene's sidebar elements
 * @param {Phaser.Scene} scene
 */
export function setElements(scene) {
  audius = scene.sidebar;
  startLoading(scene);
  // link listeners
  scene.sidebar.addListener("click");
  scene.sidebar.addListener("change");
  scene.sidebar.addListener("mousedown");
  scene.sidebar.addListener("mouseup");
  // click events
  scene.sidebar.on("click", function (event) {
    if (event.target.id === "trackVolume") {
      scene.sidebar.getChildByID("volHolder").classList.toggle("hidden");
    }

    if (event.target.id === "playBtn") {
      scene.sidebar.getChildByID("pauseBtn").classList.toggle("hidden");
      scene.sidebar.getChildByID("playBtn").classList.toggle("hidden");
      playTrack(playlistIndex);
    }

    if (event.target.id === "pauseBtn") {
      scene.sidebar.getChildByID("pauseBtn").classList.toggle("hidden");
      scene.sidebar.getChildByID("playBtn").classList.toggle("hidden");
      playlist[playlistIndex].track.pause();
    }

    if (event.target.id === "nextBtn") {
      playNextTrack();
    }

    if (event.target.id === "prevBtn") {
      playPrevTrack();
    }
  });

  // moves song to play from slider value
  scene.sidebar.on("change", function (event) {
    if (event.target.id === "trackTime") {
      const timeVal =
        (event.target.value / 100) * playlist[playlistIndex].track.duration;
      playlist[playlistIndex].track.currentTime = timeVal;
    }
  });

  // Tracks when you are clicking on track time slider
  scene.sidebar.on("mousedown", function (event) {
    if (event.target.id === "trackTime") {
      isClicking = true;
    }
  });
  scene.sidebar.on("mouseup", function (event) {
    if (event.target.id === "trackTime") {
      isClicking = false;
    }
  });
}

/**
 * Makes call to Audius to get playlist data of most popular songs
 */
export function getAudius(scene) {
  try {fetch(
    "https://audius-disco.ams-x01.nl.supercache.org/v1/playlists/DOPRl/tracks",
    {
      method: "GET",
      headers: headers,
    }
  )
    .then(function (res) {
      return res.json();
    })
    .then(function (body) {
      playlistData = body;
    })
    .then(() => makePlaylist(scene))
    .catch((error) => {
      //setAlertModal(scene, error);
    });
  }catch(e) {
    console.log("error:", e);
  }
}

/**
 * Uses song data from fetch to then fetch each song through dynamically created links.
 * That returns the current url for each song and other song info.
 * Use this to make array of Audio elements and of relevent song info.
 */
function makePlaylist(scene) {
  // Itterate through playlist data and fetch at url at that index
  for (let i = 0; i < playlistData.data.length; i++) {
    fetch(
      `https://audius-disco.ams-x01.nl.supercache.org/v1/tracks/${playlistData.data[i].id}/stream?app_name=AtlantisWorld`,
      {
        method: "GET",
      }
    )
      .then(function (res) {
        if(!res.ok) {
          throw Error(res.statusText)
        }
        // create new object that holds the track and track info
        var newObj = {
          track: undefined,
          info: {
            image: playlistData.data[i].artwork["150x150"],
            title: playlistData.data[i].title,
            artist: playlistData.data[i].user.name,
            genre: playlistData.data[i].genre,
            canplay: false,
          },
        };
        // make new Audio element with src of fetch response from playlist data urls
        newObj.track = new Audio(res.url);
        // initialize to muted
        newObj.track.volume = 0.1;
        newObj.track.setAttribute("muted", "true");
        // when a song ends, play the next song
        newObj.track.addEventListener("ended", () => {
          playNextTrack();
        });
        // if the song cant load, remove it
        newObj.track.onerror = (e) => {
          removeTrack(newObj);
        };
        newObj.track.onemptied = (e) => {
          removeTrack(newObj);
        };
        newObj.track.onstalled = (e) => {
          removeTrack(newObj);
        };
        // if no errors in loading song, set its values, increase count
        newObj.track.oncanplaythrough = (e) => {
          
            newObj.info.canplay = true;
            playlist.push(newObj);
            trackCount++;
            // once count reaches the playlist length
            if (playlistData && trackCount >= playlistData.data.length / 2) {
              playlistLoaded = true;
            }
          
        };
      })
      .catch(function (error) {
        //console.log(error);
        setAlertModal(scene, error);
      });
  }
}

/**
 * Looks for track in playlist and uses that index to remove it from playlist array
 * @param {object} obj
 */
function removeTrack(obj) {
  const trackId = findTrack(obj);
  if (trackId) {
    playlist.splice(trackId, 1);
  }
}

/**
 * Iterate over playlist comparing against obj
 * @param {object} obj song to check against
 * @returns false if not found, index number if found
 */
function findTrack(obj) {
  for (let i = 0; i < playlist.length; i++) {
    if (playlist[i] === obj) {
      return i;
    }
  }
  return false;
}

/**
 * Stops current track, moves index(making sure its within limits),
 * and then plays track at that index
 */
function playNextTrack() {
  stopTrack();
  var nextIndex = playlistIndex + 1;
  nextIndex > playlist.length
    ? (nextIndex = playlist.length)
    : (nextIndex = nextIndex);
  playTrack(nextIndex);
}

function playPrevTrack() {
  stopTrack();
  var prevIndex = playlistIndex - 1;
  prevIndex < 0 ? (prevIndex = 0) : (prevIndex = prevIndex);
  playTrack(prevIndex);
}

// Stops current playing song
function stopTrack() {
  playlist[playlistIndex].track.pause();
  playlist[playlistIndex].track.currentTime = 0;
}

/**
 * Plays song after checking that it has loaded properly.
 * If there is an error, remove track and play next one.
 * @param {number} id
 */
function playTrack(id) {
  // get elements
  var playBtn = audius.getChildByID("playBtn");
  var pauseBtn = audius.getChildByID("pauseBtn");
  if (playlist[id].info.canplay) {
    playlistIndex = id;
    playlist[playlistIndex].track.play();
    // make sure proper buttons are showing
    if (!playBtn.classList.contains("hidden")) {
      playBtn.classList.toggle("hidden");
      pauseBtn.classList.toggle("hidden");
    }
  } else {
    removeTrack(playlist[playlistIndex]);
    playlist[playlistIndex].track.play();
    if (!playBtn.classList.contains("hidden")) {
      playBtn.classList.toggle("hidden");
      pauseBtn.classList.toggle("hidden");
    }
  }
}

/**
 * Iterates over playlist, creating a list of dom elements
 * displaying individual track names and artist
 * @param {Phaser.Scene} scene
 */
function renderPlaylist(scene) {
  const tempPlaylist = playlist
    .map((song, i) => {
      // give the current playing song different styling
      if (i === playlistIndex) {
        return (
          `<p class="playlistTrack selectedTrack" id=${i}>` +
          song.info.title +
          " by " +
          song.info.artist +
          "</p>"
        );
      } else {
        return (
          '<p class="playlistTrack">' +
          song.info.title +
          " by " +
          song.info.artist +
          "</p>"
        );
      }
    })
    .join("");
  // after making all songs, put it into the playlist element
  scene.sidebar.getChildByID("playlist").innerHTML = tempPlaylist;
}

/**
 * Update music tab ui according to current song and settings
 * @param {Phaser.Scene} scene
 */
export function musicUpdate(scene) {
  // get dom elements
  var trackImg = scene.sidebar.getChildByID("trackImg");
  var trackName = scene.sidebar.getChildByID("trackName");
  var trackArtist = scene.sidebar.getChildByID("trackArtist");
  var trackTime = scene.sidebar.getChildByID("trackTime");
  var trackVol = scene.sidebar.getChildByID("trackVol");
  var pauseBtn = scene.sidebar.getChildByID("pauseBtn");
  var playBtn = scene.sidebar.getChildByID("playBtn");

  if(!checkOnline()) {
    playlist[playlistIndex].track.pause();
  }
  // turn loading off once if playlist has been loaded
  if (playlistLoaded && triggerCount < 1) {
    loadingOff(scene);
    trackVol.value = playlist[playlistIndex].track.volume * 10;
    triggerCount = 1;
  }
  // if song is playing, make sure play button is hidden and pause button isnt
  if (playlist[playlistIndex] && !playlist[playlistIndex].track.paused) {
    if (pauseBtn.classList.contains("hidden")) {
      pauseBtn.classList.toggle("hidden");
      playBtn.classList.toggle("hidden");
    }
  }
  // if playlist and elements are ready, update content
  if (trackImg && playlist && playlistLoaded && playlist[playlistIndex]) {
    trackImg.setAttribute(
      "style",
      `background-image: url("${playlist[playlistIndex].info.image}")`
    );
    trackName.innerHTML = playlist[playlistIndex].info.title;
    trackArtist.innerHTML = playlist[playlistIndex].info.artist;
    // dont let playlist index go out of bounds of playlist items
    playlistIndex < 0 ? (playlistIndex = 0) : (playlistIndex = playlistIndex);
    playlistIndex > playlist.length
      ? (playlistIndex = playlist.length)
      : (playlistIndex = playlistIndex);
    // update time slider bar as long as not clicking on it
    if (!isClicking) {
      trackTime.value =
        (playlist[playlistIndex].track.currentTime /
          playlist[playlistIndex].track.duration) *
        100;
    }
    // convert volume slider value to volume value on current song
    playlist[playlistIndex].track.volume = trackVol.value / 10;
  }
  renderPlaylist(scene);
}