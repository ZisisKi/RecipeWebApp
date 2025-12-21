import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const uploadPhotoForRecipe = async (
  recipeId,
  file,
  description = ""
) => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await axios.post(
    `${API_BASE_URL}/photos/recipe/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        recipeId: recipeId,
        description: description,
      },
    }
  );
  return response.data;
};

export const uploadPhotoForStep = async (stepId, file, description = "") => {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await axios.post(
    `${API_BASE_URL}/photos/step/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        stepId: stepId,
        description: description,
      },
    }
  );
  return response.data;
};

export const getPhotoById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/photos`, {
    params: { id: id },
  });
  return response.data;
};

export const getPhotosByRecipeId = async (recipeId) => {
  const response = await axios.get(`${API_BASE_URL}/photos/by-recipe`, {
    params: { recipeId: recipeId },
  });
  return response.data;
};

export const getPhotosByStepId = async (stepId) => {
  const response = await axios.get(`${API_BASE_URL}/photos/by-step`, {
    params: { stepId: stepId },
  });
  return response.data;
};

export const getPhotoImageUrl = (photoId) => {
  return `${API_BASE_URL}/photos/image?id=${photoId}`;
};

export const deletePhoto = async (id) => {
  await axios.delete(`${API_BASE_URL}/photos`, {
    params: { id: id },
  });
};
