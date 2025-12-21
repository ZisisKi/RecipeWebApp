import React from "react";
import { uploadPhotoForRecipe, deletePhoto } from "../../api/PhotoApi";
import styles from "./EditRecipePhotos.module.css";

const EditRecipePhotos = ({ recipeId, photos, onRefresh, showMessage }) => {

  const onFileChange = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      for (const file of files) {
        await uploadPhotoForRecipe(recipeId, file, "Φωτογραφία Συνταγής");
      }
      onRefresh();
      showMessage("📷 Η φωτογραφία συνταγής ανέβηκε!");
    } catch (error) {
      showMessage("❌ Σφάλμα ανεβάσματος.", "error");
    }
  };

  const onDeleteClick = async (photoId) => {
    if (!window.confirm("Διαγραφή φωτογραφίας;")) return;
    try {
      await deletePhoto(photoId);
      onRefresh();
      showMessage("🗑️ Η φωτογραφία διαγράφηκε.");
    } catch (error) {
      showMessage("❌ Σφάλμα διαγραφής.", "error");
    }
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>📷 Φωτογραφίες Συνταγής</label>
      
      <div className={styles.photoPreviewGrid}>
        {(photos || []).map((p) => (
          <div key={p.id} className={styles.photoWrapper}>
            <img
              src={`http://localhost:8080/api/photos/image?id=${p.id}`}
              className={styles.photoThumbnail}
              alt="recipe thumbnail"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <button
              className={styles.deleteBtn}
              onClick={() => onDeleteClick(p.id)}
              type="button"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <input
        type="file"
        className={styles.fileInput}
        onChange={onFileChange}
      />
    </div>
  );
};

export default EditRecipePhotos;