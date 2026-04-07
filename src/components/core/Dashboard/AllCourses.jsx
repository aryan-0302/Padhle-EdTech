import React, { useEffect, useState } from "react";
import { getAllCourses } from "../../../services/operations/courseDetailsAPI.js";
import CatalogCard from "../Catalog/CatalogCard.jsx";

const PAGE_SIZE = 3;


const AllCourses = () => {
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const {data, pagination:meta} = await getAllCourses(page, PAGE_SIZE);
      if (!cancelled) {
        setCourses(Array.isArray(data) ? data : []);
        setPagination(meta);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  if (loading && courses.length === 0) {
    return (
      <div className="flex h-[40vh] w-full items-center justify-center text-richblack-5">
        Loading courses...
      </div>
    );
  }

  const totalPages = pagination?.totalPages ?? 0;
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  return (
    <div className="mx-auto w-11/12 max-w-[1200px] py-6">
      <h1 className="mb-2 text-3xl font-medium text-richblack-5">All courses</h1>
      {pagination && pagination.total > 0 && (
        <p className="mb-6 text-sm text-richblack-400">
          Showing {(page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, pagination.total)} of {pagination.total} courses
        </p>
      )}
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
      {totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md bg-richblack-700 px-4 py-2 text-richblack-5 transition hover:bg-richblack-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-richblack-300">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md bg-richblack-700 px-4 py-2 text-richblack-5 transition hover:bg-richblack-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
export default AllCourses;