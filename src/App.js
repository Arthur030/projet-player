import React, { useState, useRef, useEffect } from 'react'
import './App.css'
// fix the errors with async await when running build:widget
import 'regenerator-runtime/runtime'
// used to post data to nodejs
import Axios from 'axios'
import { FaPlay, FaPause } from 'react-icons/fa'
import { MdNavigateNext, MdNavigateBefore, MdForward30 } from 'react-icons/md'
import Audio from './component/Audio'
import Image from './component/Image'
import CurrentTimeDuration from './component/CurrentTimeDuration'
import ProgressBar from './component/ProgressBar'
import Mute from './component/Mute'
import VolumeBar from './component/VolumeBar'
import BackwardThirty from './component/BackwardThirty'

function App( { domElement }) {

  // track if is playing for Play/Pause button
  const [isPlaying, setIsPlaying] = useState(false)
  // toggle mute/unmute
  const [isMuted, setIsMuted] = useState(true)
  // Index of multiple audio to be able to change tracks
  const [trackIndex, setTrackIndex] = useState(0)
  // current time of audio
  const [currentTime, setCurrentTime] = useState(0)
  //total duration of audio
  const [duration, setDuration] = useState(0)
  // when set to true, sends data to backend
  const [data, setData] = useState(false)

  // gets data from attribute data-player
  const config = domElement.getAttribute("data-player")
  // parse it into an array of object
  const track = JSON.parse(config)
  // destructuring assignment
  const {audio, img, author, title, chapters} = track[trackIndex]

  const audioRef = useRef()
  const progressBarRef = useRef()
  //to have the player paused on first render
  const firstPausedRef = useRef()
  const volume = useRef()
  

  useEffect(() => {
    setIsPlaying(false)
    //show play for the first track on first load
    if(firstPausedRef.current) {
      play()
    } else {
      firstPausedRef.current = true
    }
  }, [trackIndex])

  useEffect(() => {
    progressBarRef.current.value = Math.floor(audioRef.current.currentTime)
    //once track ends, go to the next track
    if (audioRef.current.currentTime >= audioRef.current.duration) {
      setTrackIndex(trackIndex + 1)
    } 
  }, [currentTime])

  // sends data to nodejs when clicking test button
  const submitTrack = () => {
    console.log(author)
    Axios.post('http://localhost:3001', {
      author: author,
      title: title,
      audio: audio
    })
  }

  // Onclick event that switch between Play and Pause
  const togglePlayPause = () => {
    try {
      const prevState = isPlaying
      setIsPlaying(!prevState)
      if (!prevState) {
        play()
      } else {
        pause()
      }
    } catch (err){
      console.log("error in togglePlayPause")
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      audioRef.current.volume = volume.current.value / 100
    } else {
      audioRef.current.volume = 0
    }
  }

  const play = async () => {
    try {
      // wait for the promise from play() to execute the rest of the code
      await audioRef.current.play()
      setIsPlaying(true)
      // to test database, sends data once the first time we press play
      if(!data){
        // sends data to nodejs
        submitTrack()
        console.log("sends data")
      }
      setData(true)
    } catch {
      console.log("play promise failed, retrying...")
    }
  }

  const pause = () => {
    audioRef.current.pause()
  }

  const next = () => {
    pause()
    if (trackIndex < track.length - 1) {
      setTrackIndex(trackIndex + 1)
    } else {
      setTrackIndex(0)
    }
    play()
  }

  const prev = () => {
    if (trackIndex -1 < 0) {
      pause()
      setTrackIndex(track.length -1 || track.length > 1)
      play()
    } else {
      pause()
      setTrackIndex(trackIndex - 1)
      play()
    }
  }

  const forwardThirty = () => {
    progressBarRef.current.value = Number(progressBarRef.current.value) + 30
    changeAudioToProgressBar()
  }

  const backwardThirty = () => {
    progressBarRef.current.value = Number(progressBarRef.current.value) - 30
    changeAudioToProgressBar()
  }

  // proper format for currentTime and Duration
  const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${returnedMinutes}:${returnedSeconds}`;
  }

  // When clicking the progress bar, sets the the currentTime to the progressBar value 
  const changeAudioToProgressBar = async() => {
      setCurrentTime(progressBarRef.current.value)
      audioRef.current.currentTime = progressBarRef.current.value
  } 

  // To get metadata on first load
  const onLoadedMetadata = () => {
    const seconds = Math.floor(audioRef.current.duration)
    progressBarRef.current.max = seconds
    setDuration(audioRef.current.duration)
  }

  const changeVolume = () => {
    audioRef.current.volume = volume.current.value / 100;
    if (audioRef.current.volume <= 0) {
      setIsMuted(false) 
      } else {
        setIsMuted(true)
      }
    }

  const JumpToChapter = () => {
    audioRef.current.currentTime = (chapters[0].end)
  }


  return (
    <div className="App">
      <Audio 
      audioRef={audioRef}
      audio={audio}
      onLoadedMetadata={onLoadedMetadata}
      setCurrentTime={setCurrentTime}
      />
      <Image
        img={img}
        />
      
      <div className="time-progressbar-volume-container">
      <div className="time-progressbar-container">
        <CurrentTimeDuration
          currentTime={currentTime}
          duration={duration}
          calculateTime={calculateTime}
        />
      <div>
        <ProgressBar
          progressBarRef={progressBarRef}
          changeAudioToProgressBar={changeAudioToProgressBar}
        />
      </div>
      </div>
      <div className="volume-container">
      <Mute 
          isMuted={isMuted}
          toggleMute={toggleMute}
      />
      <VolumeBar 
          volume={volume}
          changeVolume={changeVolume}
      />
      </div>
      </div>
      <div className="controls-container">
      <BackwardThirty 
      backwardThirty={backwardThirty}
      />
      <button
      className="prev"
      onClick={prev}
      >
        <MdNavigateBefore />
      </button>
      <button 
      className="play"
      onClick={togglePlayPause}
      >
      {isPlaying ? <FaPause /> : <FaPlay /> }
      </button>
      <button
      className="next"
      onClick={next}
      >  
        <MdNavigateNext />
      </button>
      <button
      className="forward-30"
      onClick={forwardThirty}
      >
        <MdForward30 />
      </button>
      </div>
      <div className="loading">

      </div>
      <div className="chapters-container">
        <h6 onClick={JumpToChapter}>Chapter 1</h6>
        <h6 onClick={JumpToChapter}>Chapter 2</h6>
        <h6 onClick={JumpToChapter}>Chapter 3</h6>
      </div>
    </div>
  );
}

export default App;
