import React from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import ReactPlayer from 'react-player'
import { BiSkipPreviousCircle } from 'react-icons/bi'
import { BiSkipNextCircle } from 'react-icons/bi'
import { MdOutlineReplayCircleFilled } from 'react-icons/md'
import { markLectureAsComplete } from '../../../services/operations/courseDetailsAPI'
import { setCompletedLectures } from '../../../slices/viewCourseSlice'
import { useDispatch } from 'react-redux'
import { matchId } from '../../../utils/matchId'

const VideoDetails = () => {
  const { courseId, sectionId, subsectionId } = useParams()
  const dispatch = useDispatch()
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { courseSectionData, completedLectures } = useSelector((state) => state.viewCourse)
  const navigate = useNavigate()
  const playerRef = useRef(null)

  const [videoData, setVideoData] = useState(null)
  const [videoEnd, setVideoEnd] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!courseSectionData?.length) {
      return
    }
    const filteredSection = courseSectionData?.filter((section) => matchId(section._id, sectionId))
    const filteredSubsection = filteredSection[0]?.subSection?.filter((subsection) =>
      matchId(subsection._id, subsectionId)
    )
    setVideoData(filteredSubsection?.[0] ?? null)
    setVideoEnd(false)
    setPlaying(false)
  }, [courseSectionData, sectionId, subsectionId])

  const isLastLecture = () => {
    const currentSectionIndex = courseSectionData?.findIndex((section) => matchId(section._id, sectionId))
    const currentSubsectionIndex = courseSectionData[currentSectionIndex]?.subSection?.findIndex((subsection) =>
      matchId(subsection._id, subsectionId)
    )
    if (
      currentSubsectionIndex === courseSectionData[currentSectionIndex]?.subSection?.length - 1 &&
      currentSectionIndex === courseSectionData?.length - 1
    ) {
      return true
    }
    return false
  }

  const isFirstLecture = () => {
    const currentSectionIndex = courseSectionData?.findIndex((section) => matchId(section._id, sectionId))
    const currentSubsectionIndex = courseSectionData[currentSectionIndex]?.subSection?.findIndex((subsection) =>
      matchId(subsection._id, subsectionId)
    )
    if (currentSubsectionIndex === 0 && currentSectionIndex === 0) {
      return true
    }
    return false
  }

  const nextLecture = () => {
    if (isLastLecture()) {
      return
    }
    const currentSectionIndex = courseSectionData?.findIndex((section) => matchId(section._id, sectionId))
    const currentSubsectionIndex = courseSectionData[currentSectionIndex]?.subSection?.findIndex((subsection) =>
      matchId(subsection._id, subsectionId)
    )
    if (currentSubsectionIndex === courseSectionData[currentSectionIndex]?.subSection?.length - 1) {
      const nextSectionId = courseSectionData[currentSectionIndex + 1]?._id
      const nextSubsectionId = courseSectionData[currentSectionIndex + 1]?.subSection[0]._id
      navigate(
        `/dashboard/enrolled-courses/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubsectionId}`
      )
    } else {
      const nextSectionId = courseSectionData[currentSectionIndex]._id
      const nextSubsectionId = courseSectionData[currentSectionIndex].subSection[currentSubsectionIndex + 1]._id
      navigate(
        `/dashboard/enrolled-courses/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubsectionId}`
      )
    }
  }

  const previousLecture = () => {
    if (isFirstLecture()) {
      return
    }
    const currentSectionIndex = courseSectionData?.findIndex((section) => matchId(section._id, sectionId))
    const currentSubsectionIndex = courseSectionData[currentSectionIndex]?.subSection?.findIndex((subsection) =>
      matchId(subsection._id, subsectionId)
    )
    if (currentSubsectionIndex === 0) {
      const previousSectionId = courseSectionData[currentSectionIndex - 1]._id
      const previousSubsectionId =
        courseSectionData[currentSectionIndex - 1]?.subSection[
          courseSectionData[currentSectionIndex - 1].subSection.length - 1
        ]._id
      navigate(
        `/dashboard/enrolled-courses/view-course/${courseId}/section/${previousSectionId}/sub-section/${previousSubsectionId}`
      )
    } else {
      const previousSectionId = courseSectionData[currentSectionIndex]?._id
      const previousSubsectionId =
        courseSectionData[currentSectionIndex]?.subSection[currentSubsectionIndex - 1]._id
      navigate(
        `/dashboard/enrolled-courses/view-course/${courseId}/section/${previousSectionId}/sub-section/${previousSubsectionId}`
      )
    }
  }

  const handleLectureCompletion = async () => {
    if (!user?._id) return
    const res = await markLectureAsComplete(
      {
        userId: user._id,
        courseId: courseId,
        subSectionId: subsectionId,
      },
      token
    )
    if (res) {
      dispatch(setCompletedLectures([...completedLectures, videoData._id]))
    }
  }

  const handleReplay = useCallback(() => {
    playerRef.current?.seekTo(0, 'seconds')
    setPlaying(true)
    setVideoEnd(false)
  }, [])

  const url = videoData?.videoUrl

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 md:py-8">
      {!videoData ? (
        <div className="flex min-h-[40vh] items-center justify-center rounded-xl border border-dashed border-richblack-600 bg-richblack-800/30 px-4 text-center text-sm text-richblack-300">
          {courseSectionData?.length ? 'Loading this lesson…' : 'Loading course…'}
        </div>
      ) : !url ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border border-richblack-600 bg-richblack-800/40 px-4 text-center text-sm text-richblack-300">
          No video for this lesson yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-richblack-600 bg-black shadow-xl ring-1 ring-black/20">
          <div className="relative aspect-video w-full">
            <div className="absolute inset-0">
              <ReactPlayer
                key={videoData._id}
                ref={playerRef}
                url={url}
                width="100%"
                height="100%"
                playing={playing}
                controls
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => {
                  setPlaying(false)
                  setVideoEnd(true)
                }}
                config={{ file: { attributes: { playsInline: true } } }}
              />
            </div>
            {videoEnd && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-6 px-4">
                <div className="absolute inset-0 bg-black/60" aria-hidden />
                <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-5">
                  {!completedLectures?.some((id) => matchId(id, videoData._id)) && (
                    <button
                      type="button"
                      onClick={() => handleLectureCompletion()}
                      className="rounded-lg bg-yellow-50 px-5 py-2.5 text-sm font-semibold text-richblack-900 shadow-md transition hover:bg-yellow-25"
                    >
                      Mark lesson complete
                    </button>
                  )}
                  <div className="flex items-center justify-center gap-6 sm:gap-10">
                    {!isFirstLecture() && (
                      <button
                        type="button"
                        onClick={previousLecture}
                        className="rounded-full bg-richblack-700 p-3 text-richblack-5 shadow-md transition hover:bg-richblack-600"
                        aria-label="Previous lesson"
                      >
                        <BiSkipPreviousCircle className="text-3xl sm:text-4xl" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleReplay}
                      className="rounded-full bg-richblack-700 p-3 text-richblack-5 shadow-md transition hover:bg-richblack-600"
                      aria-label="Replay"
                    >
                      <MdOutlineReplayCircleFilled className="text-3xl sm:text-4xl" />
                    </button>
                    {!isLastLecture() && (
                      <button
                        type="button"
                        onClick={nextLecture}
                        className="rounded-full bg-richblack-700 p-3 text-richblack-5 shadow-md transition hover:bg-richblack-600"
                        aria-label="Next lesson"
                      >
                        <BiSkipNextCircle className="text-3xl sm:text-4xl" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {videoData && (
        <div className="mt-8 border-t border-richblack-700 pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-richblack-400">This lesson</p>
          <h1 className="mt-1 text-xl font-semibold leading-snug text-richblack-5 md:text-2xl">{videoData.title}</h1>
          {videoData.description ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-richblack-200 md:text-base">{videoData.description}</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default VideoDetails
