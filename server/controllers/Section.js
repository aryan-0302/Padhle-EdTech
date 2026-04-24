import Section from "../models/Section.js"
import Course from "../models/Course.js"
import subSection from "../models/SubSection.js"
import mongoose from 'mongoose';

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





const updateSection = async (req, res) => {
    try {
      const { sectionName, sectionId, courseId } = req.body;
      if (!sectionName || !sectionId || !courseId) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }
      if (!mongoose.Types.ObjectId.isValid(sectionId) || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ success: false, message: "Invalid id" });
      }
      const existing = await Section.findById(sectionId);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Section not found" });
      }
      await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });
  
      const updatedCourse = await Course.findById(courseId)
        .populate({ path: "courseContent", populate: { path: "subSection" } })
        .exec();
  
      return res.status(200).json({
        success: true,
        message: "Section updated successfully",
        updatedCourse,
      });
    } catch (error) {
      console.error("updateSection error:", error);
      return res.status(500).json({ success: false, message: "Unable to update section,please try later!!" });
    }
  };
export {updateSection}














const deleteSection = async (req, res) => {
    try {
      const { sectionId, courseId } = req.body;
  
      if (!sectionId || !courseId) {
        return res.status(400).json({ success: false, message: "sectionId and courseId are required" });
      }
      if (!mongoose.Types.ObjectId.isValid(sectionId) || !mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({ success: false, message: "Invalid id" });
      }
  
      const section = await Section.findById(sectionId);
      if (!section) {
        return res.status(404).json({ success: false, message: "Section not found" });
      }
  
      for (const subId of section.subSection || []) {
        await subSection.findByIdAndDelete(subId);
      }
  
      await Section.findByIdAndDelete(sectionId);
  
      const updatedCourse = await Course.findByIdAndUpdate(
        courseId,
        { $pull: { courseContent: sectionId } },
        { new: true }
      )
        .populate({ path: "courseContent", populate: { path: "subSection" } })
        .exec();
  
      if (!updatedCourse) {
        return res.status(404).json({ success: false, message: "Course not found" });
      }
  
      return res.status(200).json({
        success: true,
        message: "Section deleted successfully",
        updatedCourse,
      });
    } catch (error) {
      console.error("deleteSection error:", error);
      return res.status(500).json({ success: false, message: "unable to delete the section,please try again later!!" });
    }
  };
export {deleteSection}