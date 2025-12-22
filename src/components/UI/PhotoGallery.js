import React, { useState, useEffect } from "react";
import {
  getPhotosByRecipeId,
  getPhotosByStepId,
  getPhotoImageUrl,
  deletePhoto,
} from "../../api/PhotoApi";
import classes from "./PhotoGallery.module.css";

const PhotoGallery = ({
  recipeId = null,
  stepId = null,
  onPhotoDeleted = () => {},
  allowDelete = true,
  maxPhotosToShow = null,
}) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null); // For modal view

  useEffect(() => {
    fetchPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipeId, stepId]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      let result = [];
      if (recipeId) {
        result = await getPhotosByRecipeId(recipeId);
      } else if (stepId) {
        result = await getPhotosByStepId(stepId);
      }

      // Limit photos if specified
      if (maxPhotosToShow && result.length > maxPhotosToShow) {
        result = result.slice(0, maxPhotosToShow);
      }

      setPhotos(result);
    } catch (err) {
      console.error("Failed to fetch photos:", err);
      setError("Αποτυχία φόρτωσης φωτογραφιών");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    const confirmed = window.confirm(
      "Είστε σίγουρος ότι θέλετε να διαγράψετε αυτή τη φωτογραφία;"
    );
    if (!confirmed) return;

    try {
      await deletePhoto(photoId);
      setPhotos(photos.filter((photo) => photo.id !== photoId));
      onPhotoDeleted(photoId);
    } catch (err) {
      console.error("Failed to delete photo:", err);
      alert("Αποτυχία διαγραφής φωτογραφίας");
    }
  };

  const openModal = (photo) => {
    setSelectedPhoto(photo);
  };

  const closeModal = () => {
    setSelectedPhoto(null);
  };

  if (loading) {
    return <div className={classes.loading}>Φόρτωση φωτογραφιών...</div>;
  }

  if (error) {
    return <div className={classes.error}>{error}</div>;
  }

  if (photos.length === 0) {
    return <div className={classes.empty}>Δεν υπάρχουν φωτογραφίες</div>;
  }

  return (
    <>
      <div className={classes.gallery}>
        <h4 className={classes.title}>🖼️ Φωτογραφίες ({photos.length})</h4>

        <div className={classes.grid}>
          {photos.map((photo) => (
            <div key={photo.id} className={classes.photoCard}>
              <img
                src={getPhotoImageUrl(photo.id)}
                alt={photo.description || "Recipe photo"}
                className={classes.thumbnail}
                onClick={() => openModal(photo)}
              />

              {photo.description && (
                <div className={classes.description}>{photo.description}</div>
              )}

              {allowDelete && (
                <button
                  className={classes.deleteButton}
                  onClick={() => handleDeletePhoto(photo.id)}
                  title="Διαγραφή φωτογραφίας"
                >
                  ✖
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for full-size view */}
      {selectedPhoto && (
        <div className={classes.modal} onClick={closeModal}>
          <div
            className={classes.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={classes.closeButton} onClick={closeModal}>
              ✖
            </button>

            <img
              src={getPhotoImageUrl(selectedPhoto.id)}
              alt={selectedPhoto.description || "Recipe photo"}
              className={classes.modalImage}
            />

            {selectedPhoto.description && (
              <div className={classes.modalDescription}>
                {selectedPhoto.description}
              </div>
            )}

            <div className={classes.modalInfo}>
              <small>Αρχείο: {selectedPhoto.fileName}</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;