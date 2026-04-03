const SubSection = require('../models/SubSection');
const Section = require("../models/Section");
const cloudinary = require('cloudinary').v2;
const { uploadImageToCloudinary, uploadResourceToCloudinary, extractPublicId } = require("../utils/imageUploader");

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-zip-compressed",
  "text/plain",
  "application/octet-stream",
]);
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_RESOURCES_PER_SUBSECTION = 10;

exports.createSubSection = async (req,res) =>{
    try {
        const {sectionId,title,description } = req.body;

        const video  = req.files.video;

        if(!sectionId || !title || !description || !video) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        // Normalize resources to array (express-fileupload gives object for single file)
        let resourceFiles = [];
        if (req.files && req.files.resources) {
            const raw = req.files.resources;
            resourceFiles = Array.isArray(raw) ? raw : [raw];
        }

        // Validate resource count
        if (resourceFiles.length > MAX_RESOURCES_PER_SUBSECTION) {
            return res.status(400).json({
                success: false,
                message: `Cannot attach more than ${MAX_RESOURCES_PER_SUBSECTION} resources per sub-section.`,
            });
        }

        // Validate each resource file
        for (const file of resourceFiles) {
            if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: `File type "${file.mimetype}" is not allowed. Accepted types: PDF, ZIP, RAR, TXT.`,
                });
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                return res.status(400).json({
                    success: false,
                    message: `File "${file.name}" exceeds the 100 MB size limit.`,
                });
            }
        }

        // Upload each resource to Cloudinary and build resource entries
        const resources = [];
        for (const file of resourceFiles) {
            const uploadDetails = await uploadResourceToCloudinary(file, process.env.FOLDER_NAME);
            resources.push({
                fileName: file.name,
                fileUrl: uploadDetails.secure_url,
                fileType: file.mimetype,
                fileSize: file.size,
            });
        }

        // Upload the video file to Cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

        // Create a new subSection with resources populated
        const newSubSection = await SubSection.create({
            title,
            timeDuration: `${uploadDetails.duration}`,
            description,
            videoUrl: uploadDetails.secure_url,
            resources,
        });
        
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId}, { $push: {subSection: newSubSection._id}},{new:true}).populate("subSection");

        return res.status(200).json({
            success:true,
            message:'SubSection created successfully',
           data: updatedSection
        })   
    } catch (error) {
        //console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create SubSection',
            error: error.message,
        })
    }
}

exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }

      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }

      // Parse removed resource URLs
      let removedResourceUrls = [];
      if (req.body.removedResourceUrls) {
        try {
          removedResourceUrls = JSON.parse(req.body.removedResourceUrls);
        } catch (_) {
          removedResourceUrls = [];
        }
      }

      // Delete removed resources from Cloudinary
      if (removedResourceUrls.length > 0) {
        for (const url of removedResourceUrls) {
          const publicId = extractPublicId(url);
          try {
            await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
          } catch (err) {
            return res.status(500).json({
              success: false,
              message: `Failed to delete resource from Cloudinary: ${err.message}`,
            });
          }
        }
        // Filter out deleted entries from subSection.resources
        subSection.resources = subSection.resources.filter(
          (r) => !removedResourceUrls.includes(r.fileUrl)
        );
      }

      // Handle new resource uploads
      if (req.files && req.files.resources) {
        const raw = req.files.resources;
        const newResourceFiles = Array.isArray(raw) ? raw : [raw];

        // Validate total count
        if (subSection.resources.length + newResourceFiles.length > MAX_RESOURCES_PER_SUBSECTION) {
          return res.status(400).json({
            success: false,
            message: `Cannot attach more than ${MAX_RESOURCES_PER_SUBSECTION} resources per sub-section.`,
          });
        }

        // Validate each new file
        for (const file of newResourceFiles) {
          if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            return res.status(400).json({
              success: false,
              message: `File type "${file.mimetype}" is not allowed. Accepted types: PDF, ZIP, RAR, TXT.`,
            });
          }
          if (file.size > MAX_FILE_SIZE_BYTES) {
            return res.status(400).json({
              success: false,
              message: `File "${file.name}" exceeds the 100 MB size limit.`,
            });
          }
        }

        // Upload and append new resources
        for (const file of newResourceFiles) {
          const uploadDetails = await uploadResourceToCloudinary(file, process.env.FOLDER_NAME);
          subSection.resources.push({
            fileName: file.name,
            fileUrl: uploadDetails.secure_url,
            fileType: file.mimetype,
            fileSize: file.size,
          });
        }
      }

      await subSection.save()
  
      const updatedSection = await Section.findById(sectionId).populate("subSection")

      return res.json({
        success: true,
        data: updatedSection,
        message: "Section updated successfully",
      })
    } catch (error) {
     // console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }

exports.deleteSubSection = async (req,res) =>{
    try {
        
        const {subSectionId,sectionId } = req.body;
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
              $pull: {
                subSection: subSectionId,
              },
            }
          )

        if(!subSectionId) {
            return res.status(400).json({
                success:false,
                message:'SubSection Id to be deleted is required',
            });
        }

        
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }

      const updatedSection = await Section.findById(sectionId).populate("subSection")
  
      return res.json({
        success: true,
        data:updatedSection,
        message: "SubSection deleted successfully",
      })
    } catch (error) {
        //console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to delete SubSection',
            error: error.message,
        })
    }
}
