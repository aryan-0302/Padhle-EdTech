import React, { useEffect, useState } from 'react'
import { set, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux';
import { addCourseDetails, editCourseDetails, fetchCourseCategories } from '../../../../../services/operations/courseDetailsAPI.js';
import { HiOutlineCurrencyRupee } from 'react-icons/hi';
import RequirementField from './RequirementField.jsx';
import { setStep, setCourse} from '../../../../../slices/courseSlice.js';
import IconBtn from '../../../Homepage/common/IconBtn.jsx';
import { COURSE_STATUS } from '../../../../../../utils/constant.js';
import { toast } from 'react-hot-toast';
import Upload from './Upload.jsx'
import ChipInput from './ChipInput.jsx';

const CourseInformationForm = () => {
    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm();
    

    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const { course , editCourse = false } = useSelector((state) => state.course); 
    const [loading, setLoading] = useState(false);
    const [courseCategories, setCourseCategories] = useState([]);

    useEffect(() => {
        const getCategories = async () => {
            setLoading(true);
            const categories = await fetchCourseCategories();
            console.log("categories:",categories);
            if (categories.length > 0) {
                setCourseCategories(categories);
            }
            setLoading(false);
            console.log("get categories fn")
        };

        if (editCourse && course) { // Ensure course exists
            setValue("courseTitle", course.courseName);
            setValue("courseShortDesc", course.courseDescription);
            setValue("coursePrice", course.price);
            setValue("courseTags", course.tag);
            setValue("courseBenefits", course.whatYouWillLearn);
            setValue("courseCategory", course.category);
            setValue("courseRequirements", course.instructions);
            setValue("courseImage", course.thumbnail);
        }

        getCategories();
    }, []);



    
    const isFormUpdated = () => {
        const currentValues = getValues();
        if(currentValues.courseTitle !== course.courseName ||
            currentValues.courseShortDesc !== course.courseDescription ||
            currentValues.coursePrice !== course.price ||
            currentValues.courseTitle !== course.courseName ||
            currentValues.courseTags.toString() !== course.tag.toString() ||
            currentValues.courseBenefits !== course.whatYouWillLearn ||
            currentValues.courseCategory._id !== course.category._id ||
            currentValues.courseImage !== course.thumbnail ||
            currentValues.courseRequirements.toString() !== course.instructions.toString() )
            return true;
        else
            return false;
    }

    //handles next button click 
    const onSubmit = async (data) => {
        if (editCourse) {
            if (isFormUpdated()) {
                const currentValues = getValues();
                const formData = new FormData();
    
                // Update form data for each field if it has been modified
                formData.append("courseId", course._id);
                if (currentValues.courseTitle !== course.courseName) {
                    formData.append("courseName", data.courseTitle);
                }
                if (currentValues.courseShortDesc !== course.courseDescription) {
                    formData.append("courseDescription", data.courseShortDesc);
                }
                if (currentValues.coursePrice !== course.price) {
                    formData.append("price", data.coursePrice);
                }
                if (currentValues.courseBenefits !== course.whatYouWillLearn) {
                    formData.append("whatYouWillLearn", data.courseBenefits);
                }
                if (currentValues.courseCategory._id !== course.category._id) {
                    formData.append("category", data.courseCategory);
                }
                if (currentValues.courseRequirements.toString() !== course.instructions.toString()) {
                    formData.append("instructions", JSON.stringify(data.courseRequirements));
                }
    
                setLoading(true);
                const result = await editCourseDetails(formData, token);
                setLoading(false);
    
                if (result) {
                    // Move to step 2 on success
                    dispatch(setStep(2));
                    dispatch(setCourse(result)); // Save course in state
                    //dispatch(setEditCourse(false));
                }
            } else {
                toast.error("No changes made.");
            }
            return;
        }
    
        // Create a new course
        const formData = new FormData();
        formData.append("courseName", data.courseTitle);
        formData.append("courseDescription", data.courseShortDesc);
        formData.append("price", data.coursePrice);
        formData.append("whatYouWillLearn", data.courseBenefits);
        formData.append("category", data.courseCategory);
        formData.append("instructions", JSON.stringify(data.courseRequirements));
        formData.append("status", COURSE_STATUS.DRAFT);
        formData.append("tag", JSON.stringify(data.courseTags));
        formData.append("thumbnailImage", data.courseImage);
    
        setLoading(true);
        const result = await addCourseDetails(formData, token);
        setLoading(false);
    
        if (result) {
            // After successful course creation, move to step 2
            dispatch(setStep(2));
            dispatch(setCourse(result)); // Save the new course in state
        }
    };
    

  return (
    <form
    onSubmit={handleSubmit(onSubmit)}
    className='space-y-8 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-6'
    >
        {/* title */}
        <div className='flex flex-col space-y-2'>
            <label className='text-sm text-richblack-5'  htmlFor='courseTitle'>Course Title<sup className='text-pink-200'>*</sup></label>
            <input
                id='courseTitle'
                defaultValue={course?.courseTitle}
                placeholder='Enter Course Title'
                {...register("courseTitle", {required:true})}
                className='form-style w-full'
            />
            {
                errors.courseTitle && (
                    <span className='ml-2 text-xs tracking-wide text-pink-200'>Course Title is Required**</span>
                )
            }
        </div>


        {/* description */}
        <div className='flex flex-col space-y-2'>
            <label className='text-sm text-richblack-5'  htmlFor='courseShortDesc'>Course Short Description<sup className='text-pink-200'>*</sup></label>
            <textarea
                id='courseShortDesc'
                placeholder='Enter Description'
                defaultValue={course?.courseDescription}
                {...register("courseShortDesc", {required:true})}
                className='form-style resize-x-none min-h-[130px] w-full'
                />
            {
                errors.courseShortDesc && (<span className='ml-2 text-xs tracking-wide text-pink-200'>
                    Course Description is required**
                </span>)
            }
        </div>


        {/* price */}
        <div className='relative flex flex-col space-y-2'>
            <label className='text-sm text-richblack-5' htmlFor='coursePrice'>Course Price<sup className='text-pink-200'>*</sup></label>
            <input
                id='coursePrice'
                placeholder='Enter Course Price'
                defaultValue={course?.coursePrice}
                {...register("coursePrice", {
                    required:true,
                    valueAsNumber:true
                })}
                className='form-style w-full !pl-12'
            />
            <HiOutlineCurrencyRupee size={30}  className='absolute top-7 text-richblack-400'/>
            {
                errors.coursePrice && (
                    <span className='ml-2 text-xs tracking-wide text-pink-200'>Course Price is Required**</span>
                )
            }
        </div>


        {/* category */}
        <div className='flex flex-col space-y-2'>
            <label className='text-sm text-richblack-5' htmlFor='courseCategory'>Course Category<sup className='text-pink-200'>*</sup></label>
            <select disabled={editCourse} className='form-style w-full'
            id='courseCategory'
            {...register("courseCategory", {required:true})}
            >
                <option value="" disabled>Choose a Category</option>

                {!loading && courseCategories.map((category, index) => (
    <option key={index} value={category._id}>
        {category.name}
    </option>
))}


            </select>
            {errors.courseCategory && (
                <span className='ml-2 text-xs tracking-wide text-pink-200'>
                    Course Category is Required
                </span>
            )}
        </div>




        {/* custom component for handling tags input */}
        <ChipInput
            label="Tags"
            name="courseTags"
            placeholder="Enter tags and press enter"
            register={register}
            errors={errors}
            setValue={setValue}
            getValues = {getValues}
        />



        {/*component for uploading and showing preview of media */}
        <Upload
            name={"courseImage"}
            label={"CourseImage"}
            register={register}
            errors={errors}
            setValue={setValue}
            />
        



        {/*Benefits of the Course */}
        <div className='flex flex-col space-y-2'>
            <label className='text-sm text-richblack-5'>Benefits of the course<sup className='text-pink-200'>*</sup></label>
            <textarea
            id='coursebenefits'
            placeholder='Enter Benefits of the course'
            {...register("courseBenefits", {required:true})}
            className='form-style resize-x-none min-h-[130px] w-full'
            />
            {errors.courseBenefits && (
                <span className='ml-2 text-xs tracking-wide text-pink-200'>
                    Benefits of the course are required**
                </span>
            )}
        </div>



        <RequirementField
            name="courseRequirements"
            label="Requirements/Instructions"
            register={register}
            errors={errors}
            setValue={setValue}
            getValues={getValues}
        />


        
        <div className='flex justify-end gap-x-2'>
            {
                editCourse && (
                    <button
                    onClick={() => dispatch(setStep(2))}
                    className=' text-[10px] md:text-sm p-2 px-1 font-semibold rounded-md flex items-center gap-x-2 bg-richblack-300'
                    >
                        Continue without Saving
                    </button>
                )
            }

            <IconBtn type={"submit"}
                text={!editCourse ? "Next" : "Save Changes"}
                />
        </div>
    </form>
  )
}

export default CourseInformationForm