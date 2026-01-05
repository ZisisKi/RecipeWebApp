import React from "react";
import PhotoGallery from "../../components/UI/PhotoGallery";
import PhotoUploader from "../../components/UI/PhotoUploader"; 
import classes from "./EditRecipePhotos.module.css";

const EditRecipePhotos = ({ recipeId, onRefresh, showMessage }) => {

  const handleUploadSuccess = () => {
    showMessage("Η φωτογραφία ανέβηκε επιτυχώς!", "success");
    if (onRefresh) onRefresh();
  };

  const handleUploadError = (msg) => {
    showMessage(msg, "error");
  };

  const handlePhotoDeleted = (photoId) => {
    showMessage("Η φωτογραφία διαγράφηκε.", "success");
    if (onRefresh) onRefresh();
  };

  return (
    <div className={classes.container}>
      <div className={classes.gallerySection}>
        <PhotoGallery 
          recipeId={recipeId} 
          allowDelete={true} 
          onPhotoDeleted={handlePhotoDeleted}
        />
      </div>

      <div className={classes.uploadSection}>
        <PhotoUploader 
          recipeId={recipeId}
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
        />
      </div>
    </div>
  );
};

export default EditRecipePhotos;