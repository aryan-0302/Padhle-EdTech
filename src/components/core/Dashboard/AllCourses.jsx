import React, { useEffect, useState } from "react";
import { getAllCourses } from "../../../services/operations/courseDetailsAPI.js";
import CatalogCard from "../Catalog/CatalogCard.jsx";

const AllCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await getAllCourses();
      if (!cancelled) {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[40vh] w-full items-center justify-center text-richblack-5">
        Loading courses...
      </div>
    );
  }

  return (
    <div className="mx-auto w-11/12 max-w-[1200px] py-6">
      <h1 className="mb-2 text-3xl font-medium text-richblack-5">All courses</h1>

      {courses.length ? (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <li key={course._id} className="min-w-0">
              <CatalogCard course={course} cardLayout="grid" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-richblack-300">No published courses found.</p>
      )}
    </div>
  );
};
export default AllCourses;