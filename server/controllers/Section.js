import Section from "../models/Section.js"
import Course from "../models/Course.js"
import subSection from "../models/SubSection.js"
import mongoose from 'mongoose';
import { notifyEnrolledStudentsContentUpdate } from "../utils/notificationHelper.js";

const createSection = async (req, res) => {
    try {
       
        // Extract the required properties from the request body
        const { sectionName, courseId } = req.body;
        console.log(sectionName);
        // Validate the input
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Missing required properties",
            });
        }

        // Validate courseId before querying
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid courseId",
            });
        }
      
        // Check if the course exists
        const ifcourse = await Course.findById(courseId);
        
        if (!ifcourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }
        
        // Create a new section with the given name
        const newSection = await Section.create({ sectionName });
       

        // Add the new section to the course's content array
        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            { new: true }
        )
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        
            try {
                await notifyEnrolledStudentsContentUpdate({
                    courseId,
                    title: "Course updated",
                    body: `A new section was added to "${ifcourse.courseName}".`,
                    metadata: { kind: "SECTION_ADDED" },
                });
            } catch (e) {
            console.error("notifyEnrolledStudentsContentUpdate:", e);
            }

        // Return the updated course object in the response
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updatedCourse,
        });
    } catch (error) {
        console.error("Error creating section:", error); // Log the error
        return res.status(500).json({
            success: false,
            message: "Unable to create section",
            error: error.message, // Include the actual error message for debugging
        });
    }
};

export { createSection };





const updateSection=async(req,res)=>{
    try{
        // data input
        const {sectionName,sectonId,courseId}=req.body;
        // data validation
        if(!sectionName || !sectonId){
            return res.status(400).json({
                success:false,
                message:"Missing propertiees",
            })
        }
        // update data
        const updatedSection=await Section.findByIdAndUpdate(sectonId,{sectionName},{new:true});

        let resolvedCourseId = courseId;
        if (!resolvedCourseId) {
        const parentCourse = await Course.findOne({ courseContent: sectonId }).select("_id courseName").lean();
        resolvedCourseId = parentCourse?._id;
        }
        if (resolvedCourseId) {
        try {
            const c = await Course.findById(resolvedCourseId).select("courseName").lean();
            await notifyEnrolledStudentsContentUpdate({
            courseId: resolvedCourseId,
            title: "Course updated",
            body: `A section was updated in "${c?.courseName || "your course"}".`,
            metadata: { kind: "SECTION_UPDATED" },
            });
        } catch (e) {
            console.error("notifyEnrolledStudentsContentUpdate:", e);
        }
        }

        // return res
        return res.status(200).json({
            success:true,
            message:"Section updated successfully",
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update section,please try later!!",
        })
    }
}
export {updateSection}














const deleteSection=async(req,res)=>{
    try{
        // get id:- assuming that we are gettting ID in params
        const {sectionId}=req.params;

        // find and delete
        await Section.findByIdAndDelete(sectionId);

        // we need to delete the entry from the course schema.
        const updatedCourse=await Course.findById(courseId).populate({path:"courseContext",populate:{path:"subSection"}}).exec();

        // return response
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"unable to delete the section,please try again later!!"
        })
    }
}
export {deleteSection}