import mongoose from "mongoose";

const NOTIFICATION_TYPES = [
  "ENROLLMENT_SUCCESS",
  "NEW_COURSE_PUBLISHED",
  "ENROLLED_COURSE_UPDATED",
  "CART_REMINDER",
  "NEW_STUDENT_ENROLLMENT",
  "NEW_COURSE_REVIEW"
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: NOTIFICATION_TYPES,
    },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);


const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
export { NOTIFICATION_TYPES };