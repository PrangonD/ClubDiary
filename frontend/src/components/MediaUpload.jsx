import { useState } from "react";
import { API } from "../api";
import { errorAlert, successAlert } from "../utils/alerts";

export default function MediaUpload({ clubId, onClose, onUploadSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFiles || selectedFiles.length === 0) {
      errorAlert("Error", "Please select files to upload");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("media", file);
    });

    setUploading(true);
    try {
      const { data } = await API.post(`/media/upload/${clubId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      successAlert("Success", data.message);
      setSelectedFiles([]);
      document.getElementById("media-file-input").value = "";
      onUploadSuccess();
      onClose();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to upload files";
      errorAlert("Upload Error", errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="media-upload-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="media-upload-content">
        <div className="modal-header">
          <h3>Upload Media</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleUpload} className="media-upload-form">
          <div className="form-group">
            <label htmlFor="media-file-input">Select Files</label>
            <input
              id="media-file-input"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="form-input"
            />
            <small className="form-help">
              Select multiple images or videos (Max 10 files, 50MB each)
            </small>
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <p>Selected files:</p>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading}
              style={{ width: "50%" }}
            >
              {uploading ? "Uploading..." : "Upload Files"}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ width: "50%" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
