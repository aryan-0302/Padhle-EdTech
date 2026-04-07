import React, { useEffect, useState } from 'react';
import RatingStars from '../Homepage/common/RatingStars.jsx';
import GetAvgRating from '../../../../utils/avgRating.js';
import { Link } from 'react-router-dom';

const CatalogCard = ({ course, Height, cardLayout ="default"}) => {
  const [avgReviewCount, setAvgReviewCount] = useState(0);

  useEffect(() => {
    const count = GetAvgRating(course.ratingAndReviews);
    setAvgReviewCount(count);
  }, [course]);

  const isGrid = cardLayout === "grid";

  return (
    <div
      className={
        isGrid
          ? "h-full rounded-xl border border-richblack-700 bg-richblack-800 p-3 transition-all duration-200 hover:border-richblack-600 hover:shadow-lg"
          : "mb-4 hover:scale-[1.03] transition-all duration-200 z-50"
      }
    >
      <Link to={`/courses/${course?._id}`} className={isGrid ? "flex h-full flex-col" : ""}>
        <div className={isGrid ? "flex h-full flex-col" : ""}>
          <div className={isGrid ? "shrink-0" : ""}>
            {isGrid ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-richblack-700">
                <img
                  src={course?.thumbnail}
                  alt="course thumbnail"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <img
                src={course?.thumbnail}
                alt="course thumbnail"
                className={`${Height} rounded-xl object-cover`}
              />
            )}
          </div>
          <div
            className={`flex flex-col gap-2 px-0 py-3 ${isGrid ? "min-h-0 flex-1" : "px-1"}`}
          >
            <p
              className={`line-clamp-2 font-semibold text-richblack-5 ${
                isGrid ? "text-sm md:text-base" : "text-sm md:text-xl"
              }`}
            >
              {course?.courseName}
            </p>
            <p
              className={`text-richblack-5 ${
                isGrid ? "text-xs md:text-sm" : "text-[12px] md:text-xl"
              }`}
            >
              By{" "}
              <span className="text-yellow-50">
                {course?.instructor?.firstName} {course?.instructor?.lastName}
              </span>
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-yellow-50">{avgReviewCount || 0}</span>
              <RatingStars Review_Count={avgReviewCount} />
              <span
                className={`text-richblack-5 ${isGrid ? "text-xs" : "md:block hidden md:text-xl"}`}
              >
                {course?.ratingAndReviews?.length} Ratings
              </span>
            </div>
            <p
              className={`mt-auto text-richblack-5 ${
                isGrid ? "text-sm font-semibold md:text-base" : "text-sm md:text-xl"
              }`}
            >
              Rs. {course?.price}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};
export default CatalogCard;