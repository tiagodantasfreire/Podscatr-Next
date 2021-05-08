import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css'
import { PlayerContext } from '../../contexts/playerContext';
import styles from './style.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
    const audioRef = useRef<HTMLAudioElement>(null)
    const [progress, setProgress] = useState(0);

    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying,
        isLooping,
        isShuffling,
        togglePlay,
        toggleLoop,
        toggleShuffle,
        setPlayState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        clearPlayerState
    } = useContext(PlayerContext)

    useEffect(() => {
        if (!audioRef.current) {
            return;
        } 

        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();

        }
    }, [isPlaying])

    function setupProgressListener() {
        audioRef.current.currentTime = 0;
        
        audioRef.current.addEventListener('timeupdate', event => {
            setProgress(Math.floor(audioRef.current.currentTime))
        });
    }
    
    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodeEnded() {
        if (hasNext) {
            playNext()
        } else {
            clearPlayerState 
        }
    }

    const episode = episodeList[currentEpisodeIndex];

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Tocando agora"/>
                <strong>Tocando agora</strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <Image width={592} height={592} src={episode.thumbnail}  alt={episode.title} objectFit="cover"/>
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            ) }

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>

                    <div className={styles.slider}>
                        {episode ? (
                            <Slider
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={{ backgroundColor: '#04D361'}}
                                railStyle={{ backgroundColor: '#9F75FF'}}
                                handleStyle={{ borderColor: '#04D361', borderWidth: 4 }}
                            />
                        ) : (
                            <div className={styles.emptySlider} />
                        )}
                    </div>

                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                { episode && (
                    <audio 
                        src={episode.url}
                        ref={audioRef}
                        autoPlay
                        loop={isLooping}
                        onEnded={handleEpisodeEnded}
                        onPlay={() => setPlayState(true)}             
                        onPause={() => setPlayState(false)}
                        onLoadedMetadata={setupProgressListener}
                    />
                ) }

                <div className={styles.buttons}>
                    <button 
                        type="button" 
                        disabled={!episode || episodeList.length === 1}  
                        onClick={toggleShuffle}
                        className={isShuffling ? styles.isActive : '' }
                    >
                        <img src="/shuffle.svg" alt="Embaralhar"/>
                    </button>

                    <button type="button" disabled={!episode || !hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar anterior" onClick={playPrevious} />
                    </button>

                    <button 
                        type="button" 
                        className={styles.playButton} 
                        disabled={!episode}
                        onClick={togglePlay}
                    >
                        { isPlaying ? 
                            <img src="/pause.svg" alt="Tocar"/> : 
                            <img src="/play.svg" alt="Tocar"/>
                        }
                    </button>
                    
                    <button type="button" disabled={!episode || !hasNext}>
                        <img src="/play-next.svg" alt="Tocar próxima" onClick={playNext} />
                    </button>

                    <button 
                        type="button" 
                        disabled={!episode} 
                        onClick={toggleLoop} 
                        className={isLooping ? styles.isActive : '' }
                    >
                        <img src="/repeat.svg" alt="Repetir" />
                    </button>
                    
                </div>

            </footer>

        </div>
    );
}