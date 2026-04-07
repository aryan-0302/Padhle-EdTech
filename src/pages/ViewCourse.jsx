import React, { useEffect, useState } from 'react'
import { Outlet, Navigate, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { getFullDetailsOfCourse } from '../services/operations/courseDetailsAPI'
import {
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedLectures,
} from '../slices/viewCourseSlice'
import { ACCOUNT_TYPE } from '../../utils/constant.js'
import VideoDetailsSidebar from '../components/core/ViewCourse/VideoDetailsSidebar'
import ReviewModal from '../components/core/ViewCourse/ReviewModal'

function countLectures(courseContent) {
  if (!courseContent?.length) return 0
  return courseContent.reduce(
    (acc, section) => acc + (section.subSection?.length || 0),
    0
  )
}

function ViewCourse() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { courseId } = useParams()
  const { token } = useSelector((state) => state.auth)
  const user = useSelector((state) => state.profile.user)
  const [reviewModal, setReviewModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId || !token) {
      setLoading(false)
      return
    }

    let cancelled = false

    ;(async () => {
      setLoading(true)
      const data = await getFullDetailsOfCourse(courseId, token)
      if (cancelled) return

      const courseDetails = data?.courseDetails
      if (!courseDetails) {
        toast.error(data?.message || 'Could not load this course.')
        navigate('/dashboard/enrolled-courses', { replace: true })
        return
      }

      dispatch(setCourseSectionData(courseDetails.courseContent || []))
      dispatch(setEntireCourseData(courseDetails))
      dispatch(setTotalNoOfLectures(countLectures(courseDetails.courseContent)))

      const raw = data?.completedVideos || []
      const completed = raw.filter((id) => id && id !== 'none')
      dispatch(setCompletedLectures(completed))

      setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [courseId, token, dispatch])

  if (token === null) {
    return <Navigate to="/login" replace />
  }

  if (user && user.accountType !== ACCOUNT_TYPE.STUDENT) {
    return <Navigate to="/dashboard/my-profile" replace />
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-2 border-b-2 border-richblack-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] w-full bg-richblack-900">
      <VideoDetailsSidebar setReviewModal={setReviewModal} />
      {reviewModal && <ReviewModal setReviewModal={setReviewModal} />}
      <div className="min-h-[calc(100vh-3.5rem)] flex-1 overflow-auto border-l border-richblack-700 bg-richblack-900">
        <Outlet />
      </div>
    </div>
  )
}

export default ViewCourse
