import React from "react";

// --- ΔΙΟΡΘΩΜΕΝΑ IMPORTS (από components/UI) ---
import PhotoGallery from "../../components/UI/PhotoGallery";
import PhotoUploader from "../../components/UI/PhotoUploader"; 

import styles from "./EditRecipePhotos.module.css";

const EditRecipePhotos = ({ recipeId, onRefresh, showMessage }) => {

  // Callback: Όταν το PhotoUploader ολοκληρώσει το ανέβασμα
  const handleUploadSuccess = () => {
    showMessage("📷 Η φωτογραφία ανέβηκε επιτυχώς!");
    // Καλουμε onRefresh για να ξαναφορτώσει η σελίδα τα δεδομένα (ώστε να εμφανιστεί η νέα φωτό στο Gallery)
    if (onRefresh) onRefresh();
  };

  // Callback: Όταν αποτύχει το ανέβασμα
  const handleUploadError = (msg) => {
    showMessage(`❌ ${msg}`, "error");
  };

  // Callback: Όταν διαγραφεί μια φωτογραφία μέσα από το Gallery
  const handlePhotoDeleted = (photoId) => {
    showMessage("🗑️ Η φωτογραφία διαγράφηκε.");
    if (onRefresh) onRefresh();
  };

  return (
    <div className={styles.container}>
      {/* 1. Gallery Section: Προβολή & Διαγραφή υπαρχουσών φωτογραφιών */}
      <div className={styles.gallerySection}>
        <PhotoGallery 
          recipeId={recipeId} 
          allowDelete={true} // Επιτρέπουμε διαγραφή στο Edit Mode
          onPhotoDeleted={handlePhotoDeleted}
        />
      </div>

      {/* 2. Upload Section: Προσθήκη νέων φωτογραφιών */}
      <div className={styles.uploadSection}>
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