import Notification from "../models/Notifications.js";
import User from "../models/User.js";
import Course from "../models/Course.js";

export async function createNotification({ recipientId, type, title, body, metadata }) {
  return Notification.create({
    recipient: recipientId,
    type,
    title,
    body: body || "",
    metadata: metadata || {},
  });
}

export async function notifyEnrollmentSuccess({ studentId, courseId, courseName }) {
  return createNotification({
    recipientId: studentId,
    type: "ENROLLMENT_SUCCESS",
    title: "Enrollment successful",
    body: `You enrolled in "${courseName}".`,
    metadata: { courseId: String(courseId) },
  });
}

export async function notifyInstructorNewEnrollment({
  instructorId,
  courseId,
  courseName,
  studentName,
}) {
  return createNotification({
    recipientId: instructorId,
    type: "NEW_STUDENT_ENROLLMENT",
    title: "New enrollment",
    body: `${studentName} enrolled in "${courseName}".`,
    metadata: { courseId: String(courseId) },
  });
}

export async function notifyAllStudentsNewCoursePublished(courseDoc, instructorName) {
  const courseId = courseDoc._id;
  const recent = await Notification.findOne({
    type: "NEW_COURSE_PUBLISHED",
    "metadata.courseId": String(courseId),
    createdAt: { $gte: new Date(Date.now() - 60 * 1000) },
  }).lean();
  if (recent) return;

  const students = await User.find({ accountType: "Student" }).select("_id").lean();
  if (!students.length) return;

  const title = `New course: ${courseDoc.courseName}`;
  const body = `${instructorName} published a new course — take a look.`;
  const docs = students.map((s) => ({
    recipient: s._id,
    type: "NEW_COURSE_PUBLISHED",
    title,
    body,
    metadata: {
      courseId: String(courseId),
      instructorId: courseDoc.instructor ? String(courseDoc.instructor) : undefined,
    },
  }));
  await Notification.insertMany(docs);
}

export async function notifyEnrolledStudentsContentUpdate({
  courseId,
  title,
  body,
  metadata = {},
}) {
  const course = await Course.findById(courseId).select("studentsEnrolled courseName").lean();
  if (!course?.studentsEnrolled?.length) return;

  const docs = course.studentsEnrolled.map((studentId) => ({
    recipient: studentId,
    type: "ENROLLED_COURSE_UPDATED",
    title,
    body,
    metadata: { courseId: String(courseId), ...metadata },
  }));
  await Notification.insertMany(docs);
}


export async function notifyInstructorNewReview({
    instructorId,
    courseId,
    courseName,
    studentName,
    rating,
  }) {
    return createNotification({
      recipientId: instructorId,
      type: "NEW_COURSE_REVIEW",
      title: "New review on your course",
      body: `${studentName} rated "${courseName}" ${rating} star(s).`,
      metadata: {
        courseId: String(courseId),
        rating: Number(rating),
      },
    });
  }