import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../api";
import { errorAlert, successAlert, confirmAlert } from "../utils/alerts";
import MediaUpload from "./MediaUpload";

export default function MediaGallery({ clubId: propClubId }) {
  const { clubId: paramClubId } = useParams();
  const clubId = propClubId || paramClubId;
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  // Fetch media on component mount
  useEffect(() => {
    fetchMedia();
  }, [clubId]);

  const fetchMedia = async () => {
    try {
      const { data } = await API.get(`/media/club/${clubId}`);
      setMedia(data.media || []);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch media";
      errorAlert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    const confirmed = await confirmAlert(
      "Delete Media?",
      "Are you sure you want to delete this media file? This action cannot be undone.",
      "Delete",
    );
    if (!confirmed) return;

    try {
      await API.delete(`/media/${mediaId}`);
      successAlert("Media deleted successfully");
      fetchMedia(); // Refresh gallery
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete media";
      errorAlert("Delete Error", errorMessage);
    }
  };

  const handleUploadSuccess = () => {
    fetchMedia(); // Refresh gallery
  };

  if (loading) {
    return (
      <div className="card page">
        <div
          className="skeleton"
          style={{ height: "200px", marginBottom: "20px" }}
        ></div>
        <div className="skeleton" style={{ height: "300px" }}></div>
      </div>
    );
  }

  return (
    <div className="card page">
      <div className="page-hero">
        <h2 className="page-title">Media Gallery</h2>
        <p className="page-subtitle">
          Browse and manage club photos and videos
        </p>
      </div>

      {/* Upload Button */}
      <div className="section-head">
        <button className="btn-primary" onClick={() => setShowUpload(true)}>
          Add Media
        </button>
      </div>

      {/* Gallery Section - Collage Style */}
      {media.length === 0 ? (
        <div className="empty-state">
          <p>No media uploaded yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="media-collage">
          {media.map((item) => (
            <div key={item._id} className="collage-item">
              {item.fileType === "image" ? (
                <img
                  src={item.filePath}
                  alt={item.originalName}
                  className="collage-image"
                />
              ) : (
                <video
                  src={item.filePath}
                  controls
                  className="collage-video"
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              )}

              <div className="collage-overlay">
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(item._id)}
                  title="Delete media"
                >
                  <img
                    src="/assets/delete.png"
                    alt="Delete"
                    style={{ width: "18px", height: "18px" }}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <MediaUpload
          clubId={clubId}
          onClose={() => setShowUpload(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
}
