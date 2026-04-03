import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiX } from "react-icons/fi";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "application/zip": [".zip"],
  "application/x-rar-compressed": [".rar"],
  "application/x-zip-compressed": [".zip"],
  "text/plain": [".txt"],
  "application/octet-stream": [],
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_RESOURCES = 10;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(mimeType) {
  const map = {
    "application/pdf": "PDF",
    "application/zip": "ZIP",
    "application/x-zip-compressed": "ZIP",
    "application/x-rar-compressed": "RAR",
    "text/plain": "TXT",
    "application/octet-stream": "FILE",
  };
  return map[mimeType] || mimeType;
}

export default function ResourceUpload({
  existingResources = [],
  onChange,
  viewOnly = false,
}) {
  const [pendingFiles, setPendingFiles] = useState([]);
  const [removedUrls, setRemovedUrls] = useState([]);
  const [errors, setErrors] = useState([]);

  const onDrop = (acceptedFiles) => {
    if (viewOnly) return;

    const newErrors = [];
    const validFiles = [];

    const activeExisting = existingResources.length - removedUrls.length;
    const currentTotal = activeExisting + pendingFiles.length;

    acceptedFiles.forEach((file) => {
      if (!Object.keys(ACCEPTED).includes(file.type)) {
        newErrors.push(`"${file.name}": unsupported file type (${file.type || "unknown"}).`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        newErrors.push(`"${file.name}": exceeds 100 MB limit (${formatBytes(file.size)}).`);
        return;
      }
      if (currentTotal + validFiles.length + 1 > MAX_RESOURCES) {
        newErrors.push(`"${file.name}": adding this file would exceed the 10-resource limit.`);
        return;
      }
      validFiles.push(file);
    });

    setErrors(newErrors);

    if (validFiles.length === 0) return;

    const updated = [...pendingFiles, ...validFiles];
    setPendingFiles(updated);
    onChange?.(updated, removedUrls);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED,
    onDrop,
    disabled: viewOnly,
    multiple: true,
  });

  const handleRemoveExisting = (url) => {
    const updated = [...removedUrls, url];
    setRemovedUrls(updated);
    onChange?.(pendingFiles, updated);
  };

  const handleRemovePending = (index) => {
    const updated = pendingFiles.filter((_, i) => i !== index);
    setPendingFiles(updated);
    onChange?.(updated, removedUrls);
  };

  const visibleExisting = existingResources.filter(
    (r) => !removedUrls.includes(r.fileUrl)
  );

  return (
    <div className="flex flex-col space-y-3">
      <p className="text-sm">
        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text font-medium">
          Resources
        </span>
      </p>

      {/* Drag-and-drop zone */}
      {!viewOnly && (
        <div
          {...getRootProps()}
          className={`${
            isDragActive ? "bg-richblack-600" : "bg-richblack-700"
          } flex min-h-[120px] w-full cursor-pointer items-center justify-center rounded-md border-2 border-dotted border-richblack-500 transition-colors`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="grid aspect-square w-10 place-items-center rounded-full bg-pure-greys-800">
              <FiUploadCloud className="text-xl text-yellow-50" />
            </div>
            <p className="text-sm text-richblack-200">
              Drag and drop files, or click to{" "}
              <span className="font-semibold text-yellow-50">Browse</span>
            </p>
            <p className="text-xs text-richblack-400">
              PDF, ZIP, RAR, TXT · max 100 MB · up to 10 files
            </p>
          </div>
        </div>
      )}

      {/* Existing resources */}
      {visibleExisting.length > 0 && (
        <ul className="flex flex-col gap-2">
          {visibleExisting.map((r) => (
            <li
              key={r.fileUrl}
              className="flex items-center justify-between rounded-md bg-richblack-700 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded bg-yellow-400 px-1.5 py-0.5 text-xs font-semibold text-richblack-900 shrink-0">
                  {fileTypeLabel(r.fileType)}
                </span>
                <span className="truncate text-sm text-richblack-5">
                  {r.fileName}
                </span>
              </div>
              {!viewOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(r.fileUrl)}
                  className="ml-3 shrink-0 text-richblack-300 hover:text-pink-300 transition-colors"
                  aria-label={`Remove ${r.fileName}`}
                >
                  <FiX />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Pending new files */}
      {pendingFiles.length > 0 && (
        <ul className="flex flex-col gap-2">
          {pendingFiles.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md bg-richblack-800 border border-richblack-600 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="rounded bg-blue-400 px-1.5 py-0.5 text-xs font-semibold text-richblack-900 shrink-0">
                  NEW
                </span>
                <span className="truncate text-sm text-richblack-5">
                  {file.name}
                </span>
                <span className="shrink-0 text-xs text-richblack-400">
                  {formatBytes(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePending(index)}
                className="ml-3 shrink-0 text-richblack-300 hover:text-pink-300 transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <FiX />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Inline errors */}
      {errors.length > 0 && (
        <ul className="flex flex-col gap-1">
          {errors.map((err, i) => (
            <li key={i} className="text-xs text-pink-300">
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
