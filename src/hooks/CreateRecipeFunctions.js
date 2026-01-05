import { useState, useRef } from "react";
import { createRecipe } from "../api/recipeApi";
import { createStep } from "../api/stepApi";
import { uploadPhotoForRecipe, uploadPhotoForStep } from "../api/PhotoApi";
import { useConfirm } from "../components/UI/ConfirmProvider";

export const useCreateRecipeFunctions = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: "EASY",
    category: "MAIN_COURSE",
    totalDuration: "1",
    steps: [],
    recipeIngredients: [],
    photos: [],
  });

  const [message, setMessage] = useState("");
  const [validationError, setValidationError] = useState(null);
  const [representedRecipePhotos, setRepresentedRecipePhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);
  const confirmDialog = useConfirm();

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    if (name === "totalDuration") {
      let onlyDigits = "";
      for (const char of value) {
        if (char >= "0" && char <= "9") {
          onlyDigits += char;
        }
      }
      setFormData((prev) => ({
        ...prev,
        totalDuration: onlyDigits
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddIngredient = (newIngredient) => {
    setFormData((prev) => ({
      ...prev,
      recipeIngredients: [...prev.recipeIngredients, newIngredient],
    }));
  };

  const handleRemoveIngredient = async (index) => {
    const isConfirmed = await confirmDialog({
      title: "Διαγραφή Υλικού",
      message: "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το υλικό;",
      confirmText: "Ναι, αφαίρεση",
    });

    if (isConfirmed) {
      setFormData((prev) => {
        const updated = [...prev.recipeIngredients];
        updated.splice(index, 1);
        return {
          ...prev,
          recipeIngredients: updated
        };
      });
    }
  };

  const handleAddStep = (newStepObject) => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, newStepObject],
    }));
  };

  const handleUpdateStep = (index, updatedStep) => {
    setFormData((prev) => {
      const newSteps = [...prev.steps];
      newSteps[index] = updatedStep;
      return {
        ...prev,
        steps: newSteps
      };
    });
  };

  const handleRemoveStep = async (index) => {
    const isConfirmed = await confirmDialog({
      title: "Διαγραφή Βήματος",
      message: "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το βήμα;",
      confirmText: "Διαγραφή",
    });

    if (isConfirmed) {
      setFormData((prev) => {
        const newSteps = prev.steps.filter((_, i) => i !== index);
        return {
          ...prev,
          steps: newSteps
        };
      });
    }
  };

  const handleCloseModal = () => {
    setValidationError(null);
  };

  const handleTriggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRecipePhotoSelect = (e) => {
    const files = e.target.files;
    if (!files) return;

    const maxSize = 50 * 1024 * 1024;
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp"
    ];

    try {
      const newPhotos = Array.from(files).map((file) => {
        if (file.size > maxSize) {
          throw new Error("Μέγιστο μέγεθος 50MB");
        }
        if (!allowedTypes.includes(file.type.toLowerCase())) {
          throw new Error("Μη αποδεκτός τύπος.");
        }

        return {
          file: file,
          id: Date.now() + Math.random(),
          preview: URL.createObjectURL(file),
          description: "",
          name: file.name,
        };
      });
      setRepresentedRecipePhotos((prev) => [...prev, ...newPhotos]);
    } catch (error) {
      setMessage(`Σφάλμα: ${error.message}`);
    }
  };

  const handleRemoveRecipePhoto = (photoId) => {
    setRepresentedRecipePhotos((prev) =>
      prev.filter((p) => p.id !== photoId)
    );
  };

  const handlePhotoDescChange = (photoId, val) => {
    setRepresentedRecipePhotos((prev) =>
      prev.map((p) =>
        p.id === photoId ? { ...p,
          description: val
        } : p
      )
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = formData.name.trim();
    const trimmedDesc = formData.description.trim();

    if (!trimmedName) {
      setValidationError("Η συνταγή πρέπει να έχει Όνομα!");
      return;
    }
    if (!trimmedDesc) {
      setValidationError("Η συνταγή πρέπει να έχει Περιγραφή!");
      return;
    }
    if (formData.recipeIngredients.length === 0) {
      setValidationError("Λείπουν τα Υλικά!");
      return;
    }
    if (formData.steps.length === 0) {
      setValidationError("Λείπουν τα Βήματα!");
      return;
    }

    setUploading(true);
    try {
      setMessage("Δημιουργία συνταγής...");

      const recipeData = {
        name: trimmedName,
        description: trimmedDesc,
        difficulty: formData.difficulty,
        category: formData.category,
        totalDuration: Math.max(1, parseInt(formData.totalDuration || "1", 10)),
        recipeIngredients: formData.recipeIngredients,
        steps: [],
        photos: [],
      };

      const savedRecipe = await createRecipe(recipeData);

      if (representedRecipePhotos.length > 0) {
        for (const photo of representedRecipePhotos) {
          await uploadPhotoForRecipe(
            savedRecipe.id,
            photo.file,
            photo.description
          ).catch(console.error);
        }
      }

      if (formData.steps.length > 0) {
        for (const [index, stepData] of formData.steps.entries()) {
          const stepDto = {
            title: stepData.title,
            description: stepData.description,
            stepOrder: index + 1,
            duration: parseInt(stepData.duration, 10) || 0,
            recipeId: parseInt(savedRecipe.id, 10),
            stepIngredients: stepData.stepIngredients?.map((ing) => ({
              ingredientId: parseInt(ing.ingredientId || ing.id, 10),
              quantity: parseFloat(ing.quantity),
              measurementUnit: ing.measurementUnit,
              name: ing.name
            })) || []
          };

          const createdStep = await createStep(stepDto);

          if (stepData.representedPhotos?.length > 0) {
            for (const photo of stepData.representedPhotos) {
              await uploadPhotoForStep(
                createdStep.id,
                photo.file,
                photo.description
              );
            }
          }
        }
      }

      setMessage("Επιτυχία! Η συνταγή δημιουργήθηκε!");
      setFormData({
        name: "",
        description: "",
        difficulty: "EASY",
        category: "MAIN_COURSE",
        totalDuration: "1",
        steps: [],
        recipeIngredients: [],
        photos: []
      });
      setRepresentedRecipePhotos([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setMessage(""), 5000);

    } catch (error) {
      setMessage(`Σφάλμα: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return {
    formData,
    message,
    validationError,
    representedRecipePhotos,
    uploading,
    fileInputRef,
    handlers: {
      handleBasicChange,
      handleAddIngredient,
      handleRemoveIngredient,
      handleAddStep,
      handleUpdateStep,
      handleRemoveStep,
      handleTriggerFileUpload,
      handleRecipePhotoSelect,
      handleRemoveRecipePhoto,
      handlePhotoDescChange,
      handleCloseModal,
      handleSubmit
    }
  };
};