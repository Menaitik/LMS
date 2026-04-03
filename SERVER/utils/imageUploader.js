
const cloudinary = require('cloudinary').v2;

exports.uploadImageToCloudinary = async (file , folder , height , quality) => {
    const options = {folder};
    if(height){
        options.height = height;
    }
    if(quality){
        options.quality = quality;
    }
    options.resource_type = "auto";

    return await cloudinary.uploader.upload(file.tempFilePath, options);

}

exports.uploadResourceToCloudinary = async (file, folder) => {
  return await cloudinary.uploader.upload(file.tempFilePath, {
    folder,
    resource_type: "raw",
  });
};

function extractPublicId(url) {
  // e.g. https://res.cloudinary.com/<cloud>/raw/upload/v123/<folder>/<filename>
  const parts = url.split("/upload/");
  const withVersion = parts[1]; // "v123/<folder>/<filename>"
  const withoutVersion = withVersion.replace(/^v\d+\//, "");
  return withoutVersion; // "<folder>/<filename>"
}

exports.extractPublicId = extractPublicId;
