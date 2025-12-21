import React, { useState } from "react";
import { uploadPhotoForRecipe, uploadPhotoForStep } from "../../api/PhotoApi";
import classes from "./PhotoUploader.module.css";

const PhotoUploader = ({
  recipeId = null,
  stepId = null,
  onUploadSuccess = () => {},
  onUploadError = () => {},
  disabled = false,
  accept = "image/*",
}) => {
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const validateFile = (file) => {
    if (!file) {
      throw new Error("Παρακαλώ επιλέξτε ένα αρχείο");
    }

    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      throw new Error("Το αρχείο είναι πολύ μεγάλο. Μέγιστο όριο: 50MB");
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error(
        "Μη αποδεκτός τύπος αρχείου. Επιτρέπονται: JPEG, PNG, GIF, BMP, WebP"
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);

      validateFile(selectedFile);

      if (!recipeId && !stepId) {
        throw new Error("Πρέπει να καθοριστεί είτε recipeId είτε stepId");
      }

      let result;
      if (recipeId) {
        result = await uploadPhotoForRecipe(
          recipeId,
          selectedFile,
          description
        );
      } else {
        result = await uploadPhotoForStep(stepId, selectedFile, description);
      }

      onUploadSuccess(result);

      setSelectedFile(null);
      setPreview(null);
      setDescription("");
      document.getElementById("photo-input").value = "";
    } catch (error) {
      console.error("Upload failed:", error);
      onUploadError(error.message || "Αποτυχία μεταφόρτωσης φωτογραφίας");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setDescription("");
    document.getElementById("photo-input").value = "";
  };

  return (
    <div className={classes.container}>
      <h4 className={classes.title}>📷 Προσθήκη Φωτογραφίας</h4>

      {/* File Input */}
      <div className={classes.inputGroup}>
        <label htmlFor="photo-input" className={classes.label}>
          Επιλογή Αρχείου:
        </label>
        <input
          id="photo-input"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className={classes.fileInput}
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className={classes.previewSection}>
          <label className={classes.label}>Προεπισκόπηση:</label>
          <img src={preview} alt="Preview" className={classes.previewImage} />
        </div>
      )}

      {/* Description Input */}
      <div className={classes.inputGroup}>
        <label htmlFor="photo-description" className={classes.label}>
          Περιγραφή (προαιρετικό):
        </label>
        <textarea
          id="photo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Περιγράψτε τη φωτογραφία..."
          maxLength={500}
          disabled={disabled || uploading}
          className={classes.textarea}
        />
        <small className={classes.charCount}>
          {description.length}/500 χαρακτήρες
        </small>
      </div>

      {/* Action Buttons */}
      <div className={classes.buttonGroup}>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || disabled || uploading}
          className={`${classes.button} ${classes.uploadButton}`}
        >
          {uploading ? "Μεταφόρτωση..." : "📤 Ανέβασμα"}
        </button>

        <button
          onClick={handleCancel}
          disabled={disabled || uploading}
          className={`${classes.button} ${classes.cancelButton}`}
        >
          ✖ Ακύρωση
        </button>
      </div>
    </div>
  );
};

export default PhotoUploader;
