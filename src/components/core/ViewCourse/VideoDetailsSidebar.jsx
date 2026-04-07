import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { FaChevronLeft, FaAngleDoubleRight } from 'react-icons/fa'
import { HiOutlineCheckCircle } from 'react-icons/hi'
import { matchId } from '../../../utils/matchId'

/** `showSidebar === true` means the drawer is collapsed (mobile). `false` = expanded. */
const VideoDetailsSidebar = ({ setReviewModal }) => {
  const [videoActive, setVideoActive] = useState('')
  const { courseId, sectionId, subsectionId } = useParams()
  const { courseSectionData, courseEntireData, completedLectures, totalNoOfLectures } = useSelector(
    (state) => state.viewCourse
  )
  const navigate = useNavigate()
  const [showSidebar, setShowSidebar] = useState(false)

  const courseName =
    courseEntireData && typeof courseEntireData === 'object' && !Array.isArray(courseEntireData)
      ? courseEntireData.courseName
      : null

  useEffect(() => {
    if (!courseSectionData?.length) return
    const currentSectionIndex = courseSectionData.findIndex((section) => matchId(section._id, sectionId))
    const currentSubSectionIndex = courseSectionData[currentSectionIndex]?.subSection?.findIndex((sub) =>
      matchId(sub?._id, subsectionId)
    )
    if (currentSectionIndex === -1 || currentSubSectionIndex === -1) return
    const activeId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex]._id
    setVideoActive(activeId)
  }, [courseSectionData, sectionId, subsectionId])

  const done = completedLectures?.length ?? 0
  const total = totalNoOfLectures || 0
  const progressPct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0

  const handleBack = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setShowSidebar(true)
    } else {
      navigate('/dashboard/enrolled-courses')
    }
  }

  return (
    <>
      {/* Mobile: tab to open drawer when collapsed */}
      <div className={`${showSidebar ? '' : 'hidden'} relative md:hidden`}>
        <button
          type="button"
          aria-label="Open course menu"
          className="fixed left-0 top-24 z-30 m-2 rounded-r-lg border border-richblack-600 border-l-0 bg-richblack-800 py-3 pl-1 pr-2 text-richblack-5 shadow-md"
          onClick={() => setShowSidebar(false)}
        >
          <FaAngleDoubleRight className="text-lg" />
        </button>
      </div>

      <div
        className={`relative z-20 flex h-[calc(100vh-3.5rem)] shrink-0 flex-col border-r border-richblack-600 bg-richblack-800 md:w-[280px] ${
          showSidebar ? 'hidden w-0 md:flex' : 'flex w-[min(280px,88vw)] max-w-[300px]'
        }`}
      >
        <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
          <div className="shrink-0 border-b border-richblack-600 px-4 py-4">
            <div className="mb-4 flex items-center gap-2">
              <button
                type="button"
                onClick={handleBack}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-richblack-500 bg-richblack-900 text-richblack-5 transition hover:border-richblack-400 hover:bg-richblack-700"
                aria-label="Back"
              >
                <FaChevronLeft className="text-sm" />
              </button>
              <button
                type="button"
                onClick={() => setReviewModal(true)}
                className="ml-auto rounded-lg border border-richblack-500 px-3 py-1.5 text-xs font-medium text-richblack-25 transition hover:border-yellow-50/40 hover:bg-richblack-700"
              >
                Rate course
              </button>
            </div>

            <p className="line-clamp-2 text-sm font-semibold leading-snug text-richblack-5">
              {courseName || 'Course'}
            </p>
            <p className="mt-1 text-xs text-richblack-400">Lessons</p>

            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-richblack-400">
                <span>Your progress</span>
                <span>
                  {done} / {total}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-richblack-600">
                <div
                  className="h-full rounded-full bg-yellow-50/90 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
            {!courseSectionData?.length ? (
              <p className="px-3 py-8 text-center text-xs text-richblack-500">No lessons in this course.</p>
            ) : (
              courseSectionData.map((section) => (
              <details
                key={section._id}
                open={matchId(section._id, sectionId)}
                className="group mb-2 rounded-lg border border-richblack-600 bg-richblack-900/40"
              >
                <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-richblack-25 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    <span className="line-clamp-2">{section?.sectionName}</span>
                    <span className="shrink-0 text-xs text-richblack-500 transition group-open:rotate-180">▼</span>
                  </span>
                </summary>
                <ul className="border-t border-richblack-600/80 pb-1">
                  {(section?.subSection ?? []).map((sub) => {
                    const active = matchId(sub?._id, videoActive)
                    const complete = completedLectures?.some((id) => matchId(id, sub?._id))
                    return (
                      <li key={sub._id}>
                        <button
                          type="button"
                          onClick={() => {
                            setShowSidebar(true)
                            navigate(
                              `/dashboard/enrolled-courses/view-course/${courseId}/section/${section._id}/sub-section/${sub._id}`
                            )
                          }}
                          className={`flex w-full items-start gap-2 border-l-2 py-2.5 pl-3 pr-2 text-left text-sm transition ${
                            active
                              ? 'border-yellow-50 bg-richblack-700 text-richblack-5'
                              : 'border-transparent text-richblack-200 hover:bg-richblack-700/50'
                          }`}
                        >
                          <span className="mt-0.5 shrink-0">
                            {complete ? (
                              <HiOutlineCheckCircle className="text-lg text-caribbeangreen-100" aria-hidden />
                            ) : (
                              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-richblack-500" aria-hidden />
                            )}
                          </span>
                          <span className="line-clamp-2 leading-snug">{sub?.title}</span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </details>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile: tap outside to collapse drawer */}
      {!showSidebar && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-10 bg-richblack-900/50 md:hidden"
          onClick={() => setShowSidebar(true)}
        />
      )}
    </>
  )
}

export default VideoDetailsSidebar
