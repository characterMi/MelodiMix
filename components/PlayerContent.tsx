import { usePlayer } from "@/hooks/usePlayer";
import type { Song } from "@/types/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { BiArrowToRight } from "react-icons/bi";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { IoShuffleOutline } from "react-icons/io5";
import { TfiLoop } from "react-icons/tfi";
import useSound from "use-sound";
import Duration from "./Duration";
import LikedButton from "./LikedButton";
import Slider from "./Slider";
import SongItem from "./SongItem";

const PlayerContent = ({ song, songUrl }: { song: Song; songUrl: string }) => {
  const { ids, playerType, setId, setPlayType, setVolume, volume, activeId } =
    usePlayer((state) => ({
      ids: state.ids,
      playerType: state.playerType,
      setId: state.setId,
      setPlayType: state.setPlayType,
      setVolume: state.setVolume,
      volume: state.volume,
      activeId: state.activeId,
    }));

  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicLoading, setIsMusicLoading] = useState(true);

  const [play, { pause, sound, duration /* to ms */ }] = useSound(songUrl, {
    volume,
    format: ["mp3"],
    onplay: () => setIsMusicPlaying(true),
    onend: onPlaySong,
    onpause: () => setIsMusicPlaying(false),
    onload: () => setIsMusicLoading(false),
  });

  const PauseOrPlayIcon = isMusicPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;
  const PlayerTypeIcon =
    playerType === "next-song"
      ? BiArrowToRight
      : playerType === "shuffle"
      ? IoShuffleOutline
      : TfiLoop;

  function handleChangePlayerType() {
    if (playerType === "next-song") {
      setPlayType("shuffle");
      toast.success('Change the type to "Shuffle"');
    }

    if (playerType === "shuffle") {
      setPlayType("loop");
      toast.success('Change the type to "Loop"');
    }

    if (playerType === "loop") {
      setPlayType("next-song");
      toast.success('Change the type to "Next song"');
    }
  }

  function onPlaySong(type: "next" | "previous" = "next") {
    if (ids.length <= 1) return;

    if (playerType === "loop") {
      sound?.seek(0);
      sound?.pause();
      setIsMusicPlaying(false);
      return;
    }

    const currentIndex = ids.findIndex((id) => id === activeId);

    let nextSongToPlay = ids[currentIndex];

    if (playerType === "next-song") {
      nextSongToPlay =
        type === "next" ? ids[currentIndex + 1] : ids[currentIndex - 1];

      if (!nextSongToPlay) {
        nextSongToPlay = type === "next" ? ids[0] : ids[ids.length - 1];
      }
    }

    if (playerType === "shuffle") {
      const randomId = generateNextSongIndex(currentIndex);

      nextSongToPlay = ids[randomId];
    }

    setId(nextSongToPlay);
  }

  const generateNextSongIndex = (currentIndex: number): number => {
    if (ids.length === 1) return 0; // if the length of our playlist is 1, we don't want to play a random music, but instead we want to play the current music

    const nextSongIndex = Math.floor(Math.random() * ids.length);

    if (nextSongIndex === currentIndex)
      return generateNextSongIndex(currentIndex);

    return nextSongIndex;
  };

  const handlePlay = () => {
    if (!isMusicPlaying) {
      play();
    } else {
      pause();
    }
  };

  const toggleMute = () => {
    if (volume === 0) {
      setVolume(1);
    } else {
      setVolume(0);
    }
  };

  useEffect(() => {
    sound?.play();

    return () => sound?.unload();
  }, [sound]);

  return (
    <>
      <Duration duration={duration!} sound={sound} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 h-full relative">
        <div className="flex w-full justify-start relative">
          <div className="flex items-center gap-x-4 w-full">
            <SongItem player data={song} />
            <div className="flex items-center gap-x-2 w-max bg-black h-full absolute top-0 right-0 pl-1 after:w-5 after:h-full after:absolute after:right-full after:top-0 after:bg-gradient-to-l after:from-black">
              <LikedButton songId={song.id} songTitle={song.title} />
              <PlayerTypeIcon
                size={playerType === "loop" ? 28 : 32}
                className="cursor-pointer"
                onClick={handleChangePlayerType}
              />
            </div>
          </div>
        </div>

        <div className="flex sm:hidden absolute -top-full -translate-y-1/4 right-0">
          <div
            onClick={handlePlay}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white p-1 cursor-pointer overflow-hidden"
          >
            {isMusicLoading ? (
              <div className="size-6 rounded-full border-4 animate-spin border-black relative after:size-3 after:bg-white after:absolute after:bottom-3/4 after:rotate-45" />
            ) : (
              <PauseOrPlayIcon size={30} className="text-black" />
            )}
          </div>
        </div>

        <div className="hidden z-10 h-full sm:flex sm:justify-end md:justify-center items-center w-full max-w-[722px] gap-x-6">
          <AiFillStepBackward
            onClick={() => onPlaySong("previous")}
            size={30}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />

          <div
            onClick={handlePlay}
            className="flex items-center justify-center size-10 rounded-full bg-white p-1 cursor-pointer overflow-hidden"
          >
            {isMusicLoading ? (
              <div className="size-6 rounded-full border-4 animate-spin border-black relative after:size-3 after:bg-white after:absolute after:bottom-3/4 after:rotate-45" />
            ) : (
              <PauseOrPlayIcon size={30} className="text-black" />
            )}
          </div>

          <AiFillStepForward
            onClick={() => onPlaySong("next")}
            size={30}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />
        </div>

        <div className="hidden md:flex w-full justify-end pr-2">
          <div className="flex items-center gap-x-2 w-[120px]">
            <VolumeIcon
              onClick={toggleMute}
              className="cursor-pointer"
              size={34}
            />

            <Slider
              value={volume}
              onChange={(value) => setVolume(value)}
              bgColor="bg-white"
              max={1}
              step={0.1}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerContent;
