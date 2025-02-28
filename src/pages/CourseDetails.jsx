import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { BsGlobe } from 'react-icons/bs';
import { FaShareSquare } from 'react-icons/fa';
import {FaChevronDown} from 'react-icons/fa';
import {IoVideocamOutline} from 'react-icons/io5';


import { addToCart } from '../slices/cartSlice.js';
import { ACCOUNT_TYPE } from '../../utils/constant.js';
import { buyCourse } from '../services/operations/studentFeaturesAPI.js'
import { fetchCourseDetails } from '../services/operations/courseDetailsAPI.js';
import RatingStars from '../components/core/Homepage/common/RatingStars.jsx';
import GetAvgRating from '../../utils/avgRating.js';


import { FaRobot } from "react-icons/fa6";
import { FaTimes } from "react-icons/fa";
import Chatbot from "../components/Chatbot"; // Import chatbot component

const CourseDetails = () => {
    const [showChatbot, setShowChatbot] = useState(false);
    const {token} = useSelector((state) => state.auth);
    const {user} = useSelector((state) => state.profile);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {courseId} = useParams();
    const [courseDetail, setCourseDetail] = useState(null);
    const [avgReviewCount, setAvgReviewCount] = useState(0);
    const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
    const {cart}=useSelector((state)=>state.cart);


    const handelPayment = () => {
        if(token){
            buyCourse(token,[courseId],user,navigate,dispatch);
        }
        else{
            navigate('/login');
        }
    }

    useEffect(() => {
        const getCourseDetails = async() => {
            const response = await fetchCourseDetails(courseId,dispatch);
            // console.log("getCourseDetails -> response", response);
            setCourseDetail(response);
        }
        getCourseDetails();
    }, [courseId]);

    useEffect(() => {
        if(courseDetail?.ratingAndReviews?.length > 0){
            const count = GetAvgRating(courseDetail?.ratingAndReviews);
            setAvgReviewCount(count);
            console.log("getCourseDetails -> count", parseInt(count));
            }
    }, [courseDetail?.ratingAndReviews]);


    //add to cart
    const handelAddToCart = () => {
        if(token){
        dispatch(addToCart(courseDetail));
        // console.log("handelAddToCart -> courseId", courseDetail._id)
        }
        else{
            navigate('/login');
        }
    }


    useEffect (() => {
    if(courseDetail){
        const Enrolled = courseDetail?.studentsEnrolled?.find((student) => student === user?._id);
        // console.log("CourseDetails -> Enrolled", Enrolled)
        if(Enrolled){
            setAlreadyEnrolled(true);
        }
    }
    }, [courseDetail, user?._id])





    if(!courseDetail) return <div className='flex justify-center items-center h-screen'>
        <div className='custom-loader'></div>
    </div>

  return (
    <div>
        <div className='mx-auto box-content px-4 lg:w-[1260px] lg:relative '>
            <div className='mx-auto grid min-h-[450px] max-w-maxContentTab justify-items-center py-8 lg:mx-0 lg:justify-items-start lg:py-0 xl:max-w-[810px]'>
                <div className='relative block max-h-[30rem] lg:hidden'>
                    <div className='absolute bottom-0 left-0 h-full w-full shadow-[#161D29_0px_-64px_36px_-28px_inset]'></div>
                        <img src={courseDetail?.thumbnail} alt="course img" />
                </div>
                    <div className='z-30 my-5 flex flex-col justify-center gap-4 py-5 text-lg text-richblack-5'>  
                            <p className='text-4xl font-bold text-richblack-5 sm:text-[42px]'>{courseDetail?.courseName}</p>
                            <p className='text-richblack-200'>{courseDetail?.courseDescription}</p>
                            <div className='flex gap-x-3 items-center'>
                        <span className='text-yellow-50'>{avgReviewCount || 0}</span>
                        <RatingStars Review_Count={avgReviewCount} />
                        <span className=' md:block hidden md:text-xl text-richblack-5'>({courseDetail?.ratingAndReviews?.length} Reviews)</span>
                        {/* student enrolled */}
                        <span className='text-richblack-200'>{courseDetail?.studentsEnrolled?.length} students enrolled</span>
                    </div>
                    <div>
                        <p>Created By {courseDetail?.instructor?.firstName}  {courseDetail?.instructor?.lastName}</p>
                    </div>
                    <div className='flex flex-wrap gap-5 text-lg'>
                        <AiOutlineInfoCircle className='text-2xl text-richblack-5' />
                        <p className='text-richblack-50'>Created at &nbsp;    
                        {new Date(courseDetail?.createdAt || courseDetail?.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                        </p>
                        <p className='flex items-center gap-2 text-richblack-50'><BsGlobe className='text-lg text-richblack-50'/>English</p>
                    </div>
                    </div>
                    <div className='flex w-full flex-col gap-4 border-y border-y-richblack-500 py-4 lg:hidden'>
                        <p className='space-x-3 pb-4 text-3xl font-semibold text-richblack-5'>
                            <span>₹{courseDetail?.price}</span></p>
                            {ACCOUNT_TYPE.INSTRUCTOR !==user?.accountType &&
                            <>
                            {
                                alreadyEnrolled ? <button onClick={()=>{navigate("/dashboard/enrolled-courses")}}  className='yellowButton'>Go to Course</button> : <button onClick={handelPayment} className='yellowButton'>Buy Now</button>
                            }
                            {
                                alreadyEnrolled ? (<div></div>) : 
                                (
                                    cart?.find((item) => item?._id === courseDetail?._id) ?
                                    (<button onClick={()=>{navigate("/dashboard/cart")}} className='blackButton text-richblack-5'>Go to Cart</button>) :
                                    (<button onClick={handelAddToCart} className='blackButton text-richblack-5'>Add to Cart</button>)
                                )
                            }
                            </>
                            }
                    </div>
                </div>
                <div className='right-[1rem] top-[60px] mx-auto hidden min-h-[600px] w-1/3 max-w-[410px] translate-y-24 md:translate-y-0 lg:absolute  lg:block'>
                    <div className='flex flex-col gap-4 rounded-md bg-richblack-700 p-4 text-richblack-5'>
                        <img src={courseDetail?.thumbnail} alt="course img" className='max-h-[300px] min-h-[180px] w-[400px] overflow-hidden rounded-2xl object-cover md:max-w-full' />
                        <div className='px-4'>
                            <div className='space-x-3 pb-4 text-3xl font-semibold'>
                                <span>₹{courseDetail?.price}</span>
                            </div>
                            <div className='flex flex-col gap-4'>
                                {ACCOUNT_TYPE.INSTRUCTOR !==user?.accountType &&
                                <>
                                {
                                    alreadyEnrolled ? <button onClick={()=>{navigate("/dashboard/enrolled-courses")}} className='yellowButton'>Go to Course</button> : <button onClick={handelPayment} className='yellowButton'>Buy Now</button>
                                }
                                {
                                alreadyEnrolled ? (<div></div>) : 
                                (
                                    cart?.find((item) => item._id === courseDetail._id) ?
                                    (<button onClick={()=>{navigate("/dashboard/cart")}} className='blackButton text-richblack-5'>Go to Cart</button>) :
                                    (<button onClick={handelAddToCart} className='blackButton text-richblack-5'>Add to Cart</button>)
                                )
                            }
                                </>
                                }
                            </div>
                            <div className='pb-3 pt-6 text-center text-sm text-richblack-25'>
                                <p>30-Day Money-Back Guarantee</p>
                            </div>
                            <div className=''>
                                <p className='my-2 text-xl font-semibold '>This course includes</p>
                                <div className='flex flex-col gap-1 text-sm text-caribbeangreen-100'>
                                    {
                                        JSON.parse(courseDetail?.instructions).map((item,index) => (
                                            <div key={index} className='flex gap-2 items-center'>
                                                <span className='text-lg'>✓</span>
                                                <span>{item}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className='text-center'>
                                {/* copy url */}
                                <button className='mx-auto flex items-center gap-2 py-6 text-yellow-100' onClick={
                                    () => {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast.success('URL copied to clipboard');
                                    }
                                }>
                                    <FaShareSquare className='text-xl text-yellow-200'/>
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]'>
                <div className='mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[810px]'>
                    <div className='my-8 border border-richblack-600 p-8'>
                        <p className='text-3xl font-semibold'>
                            What you'll learn
                        </p>
                        <div className='mt-5'>
                            {
                                courseDetail?.whatYouWillLearn
                            }
                        </div>
                    </div>
                    <div className='max-w-[830px] '>
                        <div className='flex flex-col gap-3'>
                            <p className='text-[28px] font-semibold'>Course Content</p>
                            <div className='flex flex-wrap justify-between gap-2'>
                                <div className='flex gap-2'>
                                <span>{courseDetail?.courseContent?.length} Section(s)</span>
                                <span>{courseDetail?.courseContent?.reduce((acc, item) => acc + item?.subSection?.length, 0)} Lecture(s)</span>
                                </div>
                                <button className='text-yellow-25'>
                                    <span>Collapse all sections</span>
                                </button>
                            </div>
                        </div>
                        <div className='py-4'>
                            {
                                courseDetail?.courseContent?.map((item, index) => (
                                    <details key={index} className=' border border-solid border-richblack-600 bg-richblack-700 text-richblack-5 detailanimatation'>
                                        <summary className='flex cursor-pointer items-start justify-between bg-opacity-20 px-7  py-5 transition-[0.3s]'>
                                            <div className='flex items-center gap-2'>
                                            <FaChevronDown className='arrow '/>
                                            <span className='text-xl'>{item?.sectionName}</span>
                                            </div>
                                            <div className='space-x-4'>
                                                <span className='text-yellow-25'>{item?.subSection?.length} Lecture(s)</span>
                                            </div>
                                        </summary>
                                        <div className='mt-5'>
                                            {
                                                item?.subSection?.map((subItem, subIndex) => (
                                                    <div key={subIndex} className='relative overflow-hidden bg-richblack-900  p-5 border border-solid border-richblack-600'>
                                                        <div className='flex items-center gap-2'>
                                                        <IoVideocamOutline className='txt-lg text-richblack-5'/>
                                                        <span className='text-lg'>{subItem?.title}</span>
                                                        </div>
                                                    </div>
                                                    
                                                ))
                                            }
                                            </div>
                                    </details>
                                ))
                            }
                        </div>
                    </div>
                </div>
                <div className='mb-12 py-4'>
            </div>
                <p className='text-[28px] font-semibold'>
                    Author
                </p>
                <div className='flex items-center gap-4 py-4'>
                <img 
    src={courseDetail?.instructor?.image || "/default-profile.png"} 
    alt="author img" 
    className='w-[50px] h-[50px] rounded-full object-cover' 
/>
                    <p className='text-xl font-semibold'>{courseDetail?.instructor?.firstName} {courseDetail?.instructor?.lastName}</p>
                </div>
                <p className='text-richblack-50 text-sm mb-10'>{courseDetail?.instructor?.additionalDetails?.about}</p>
            </div>

            {/* Reviews */}
            <div className='mx-auto box-content px-4 text-start text-richblack-5 lg:w-[1260px]'>
                <div className='mx-auto max-w-maxContentTab lg:mx-0 xl:max-w-[990px]'>
                    <div className='my-8 border border-richblack-600 p-3 md:p-8'>
                        <p className='text-3xl font-semibold'>
                            Reviews
                        </p>
                        <div className='mt-5'>
                            <div className='flex items-center gap-4'>
                                <div className='flex items-center gap-2'>
                                    <span className='text-4xl font-semibold'>{avgReviewCount}</span>
                                    <span className='text-2xl'>/5</span>
                                    <span className='text-richblack-50'>({courseDetail?.ratingAndReviews?.length} ratings)</span>
                                    <span className='text-richblack-50'>|</span>
                                    <span className='text-richblack-50'> {courseDetail?.studentsEnrolled?.length} students</span>
                                    </div>
                                </div>
                                </div>
                                {
                                    courseDetail?.ratingAndReviews?.map((item, index) => (
                                        <div key={index} className='flex flex-col md:items-baseline gap-3 my-4 mt-12 ga'>
                                            <div className='flex items-center gap-2'>
                                            <img 
    src={item?.user?.image || "/default-profile.png"} 
    alt="user img" 
    className='w-[30px] h-[30px] rounded-full object-cover' 
/>
                                                <div className='flex flex-col'>
                                                    <p className='md:text-xl min-w-max font-semibold'>{item?.user?.firstName} {item?.user?.lastName}</p>
                                                </div>
                                            </div>
                                            <div className='flex flex-col gap-2'>
                                                <div className='flex items-center gap-2'>
                                                    <RatingStars Review_Count={item?.rating}/>
                                                </div>
                                                <p className='text-richblack-50 text-[12px] md:text-sm max-w-4xl'>{item?.review}</p>
                                            </div>
                                        </div>
                                    ))
                                }
                                </div>
                                </div>
                                </div>
                                


        {/* AI Assistant Button - Fixed at Bottom Right */}
 <div className="fixed bottom-20 right-20 z-50">
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all"
        >
          {showChatbot ? <FaTimes size={25} /> : <FaRobot size={40} />}
        </button>
      </div>

      {/* Chatbot UI (Opens when clicked) */}
      {showChatbot && (
        <div className="fixed bottom-32 right-20 bg-white shadow-lg border border-gray-300 rounded-lg w-80 h-[700px] p-4">
          <Chatbot setShowChatbot={setShowChatbot} />
        </div>
      )}
                         
        </div>
  )
}

export default CourseDetails