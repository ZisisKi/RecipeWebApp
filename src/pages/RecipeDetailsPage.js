import React, { useEffect, useState } from "react";
import { getRecipeById, deleteRecipe } from "../api/recipeApi";
import {
  getPhotosByRecipeId,
  getPhotosByStepId,
  getPhotoImageUrl,
} from "../api/PhotoApi";
import classes from "./RecipeDetailsPage.module.css";

const RecipeDetailsPage = ({ recipeId, onEdit, onBack }) => {
  const [recipe, setRecipe] = useState(null);
  const [recipePhotos, setRecipePhotos] = useState([]);
  const [stepPhotos, setStepPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ingredients");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photosLoading, setPhotosLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        console.log("Fetching recipe details for ID:", recipeId);

        const data = await getRecipeById(recipeId);
        setRecipe(data);

        await fetchAllPhotos(data);

        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch recipe:", err);
        setError("Η φόρτωση της συνταγής απέτυχε.");
        setLoading(false);
      }
    };

    if (recipeId) {
      fetchDetails();
    }
  }, [recipeId]);

  const fetchAllPhotos = async (recipeData) => {
    try {
      setPhotosLoading(true);
      const photos = await getPhotosByRecipeId(recipeId);

      setRecipePhotos(photos || []);

      if (recipeData.steps && recipeData.steps.length > 0) {
        const stepPhotoMap = {};

        for (const step of recipeData.steps) {
          try {
            const photos = await getPhotosByStepId(step.id);
            stepPhotoMap[step.id] = photos || [];
          } catch (stepPhotoError) {
            stepPhotoMap[step.id] = [];
          }
        }

        setStepPhotos(stepPhotoMap);
      }

      setPhotosLoading(false);
    } catch (photosError) {
      setPhotosLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Είσαι σίγουρος ότι θέλεις να διαγράψεις οριστικά αυτή τη συνταγή;"
    );
    if (confirmed) {
      try {
        await deleteRecipe(recipeId);
        alert("Η συνταγή διαγράφηκε επιτυχώς!");
        onBack();
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Σφάλμα κατά τη διαγραφή της συνταγής.");
      }
    }
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "#4CAF50";
      case "MEDIUM":
        return "#FF9800";
      case "HARD":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "APPETIZER":
        return "🥗";
      case "MAIN_COURSE":
        return "🍽️";
      case "DESSERT":
        return "🍰";
      case "SALAD":
        return "🥙";
      case "SNACK":
        return "🍿";
      default:
        return "🍴";
    }
  };

  const translateCategory = (category) => {
    const translations = {
      APPETIZER: "Ορεκτικό",
      MAIN_COURSE: "Κυρίως Πιάτο",
      DESSERT: "Επιδόρπιο",
      SALAD: "Σαλάτα",
      SNACK: "Σνακ",
    };
    return translations[category] || category;
  };

  const translateDifficulty = (difficulty) => {
    const translations = {
      EASY: "Εύκολο",
      MEDIUM: "Μέτριο",
      HARD: "Δύσκολο",
    };
    return translations[difficulty] || difficulty;
  };

  const getTotalStepsTime = () => {
    if (!recipe?.steps || recipe.steps.length === 0) return 0;
    return recipe.steps.reduce(
      (total, step) => total + (step.duration || 0),
      0
    );
  };

  const PhotoThumbnail = ({ photo, onClick, size = "150px" }) => (
    <div
      style={{
        cursor: "pointer",
        border: "2px solid #e0e0e0",
        borderRadius: "8px",
        overflow: "hidden",
        transition: "transform 0.2s, box-shadow 0.2s",
        width: size,
        backgroundColor: "white",
      }}
      onClick={() => onClick(photo)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          width: "100%",
          height: size,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={getPhotoImageUrl(photo.id)}
          alt={photo.description || "Recipe photo"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div
          style={{
            display: "none",
            width: "100%",
            height: "100%",
            background: "#f5f5f5",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            fontSize: "2rem",
            color: "#999",
          }}
        >
          📷
          <div style={{ fontSize: "0.8rem", marginTop: "5px" }}>
            Image not available
          </div>
        </div>
      </div>

      {photo.description && (
        <div
          style={{
            padding: "8px",
            fontSize: "0.8rem",
            color: "#666",
            textAlign: "center",
            borderTop: "1px solid #eee",
          }}
        >
          {photo.description}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <div className={classes.spinner}></div>
        <p>Φόρτωση λεπτομερειών συνταγής...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={classes.errorContainer}>
        <div className={classes.errorIcon}>⚠️</div>
        <p>{error}</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className={classes.notFoundContainer}>
        <div className={classes.notFoundIcon}>🔍</div>
        <p>Η συνταγή δεν βρέθηκε.</p>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <div className={classes.heroSection}>
        <div className={classes.heroBackground}>
          <div className={classes.heroContent}>
            <div className={classes.titleRow}>
              <h1 className={classes.heroTitle}>{recipe.name}</h1>
              <div className={classes.actionButtons}>
                <button
                  className={`${classes.actionBtn} ${classes.editBtn}`}
                  onClick={onEdit}
                  title="Επεξεργασία συνταγής"
                >
                  <span className={classes.btnIcon}>✏️</span>
                  Επεξεργασία
                </button>
                <button
                  className={`${classes.actionBtn} ${classes.deleteBtn}`}
                  onClick={handleDelete}
                  title="Διαγραφή συνταγής"
                >
                  <span className={classes.btnIcon}>❌</span>
                  Διαγραφή
                </button>
              </div>
            </div>

            {/* RECIPE STATS */}
            <div className={classes.statsContainer}>
              <div className={classes.statCard}>
                <div className={classes.statIcon}>⏱️</div>
                <div className={classes.statContent}>
                  <span className={classes.statValue}>
                    {recipe.totalDuration}
                  </span>
                  <span className={classes.statLabel}>Λεπτά</span>
                </div>
              </div>

              <div className={classes.statCard}>
                <div className={classes.statIcon}>📊</div>
                <div className={classes.statContent}>
                  <span
                    className={classes.statValue}
                    style={{ color: getDifficultyColor(recipe.difficulty) }}
                  >
                    {translateDifficulty(recipe.difficulty)}
                  </span>
                  <span className={classes.statLabel}>Δυσκολία</span>
                </div>
              </div>

              <div className={classes.statCard}>
                <div className={classes.statIcon}>
                  {getCategoryIcon(recipe.category)}
                </div>
                <div className={classes.statContent}>
                  <span className={classes.statValue}>
                    {translateCategory(recipe.category)}
                  </span>
                  <span className={classes.statLabel}>Κατηγορία</span>
                </div>
              </div>

              {recipe.steps && recipe.steps.length > 0 && (
                <div className={classes.statCard}>
                  <div className={classes.statIcon}>📋</div>
                  <div className={classes.statContent}>
                    <span className={classes.statValue}>
                      {recipe.steps.length}
                    </span>
                    <span className={classes.statLabel}>Βήματα</span>
                  </div>
                </div>
              )}

              {recipePhotos.length > 0 && (
                <div className={classes.statCard}>
                  <div className={classes.statIcon}>📷</div>
                  <div className={classes.statContent}>
                    <span className={classes.statValue}>
                      {recipePhotos.length}
                    </span>
                    <span className={classes.statLabel}>Φωτογραφίες</span>
                  </div>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            {recipe.description && (
              <div className={classes.descriptionCard}>
                <h3 className={classes.descriptionTitle}>Περιγραφή</h3>
                <p className={classes.descriptionText}>{recipe.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECIPE PHOTOS SECTION */}
      {recipePhotos.length > 0 && (
        <div
          style={{
            background: "white",
            margin: "0 2rem 2rem 2rem",
            borderRadius: "15px",
            padding: "2rem",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "1.5rem",
              fontSize: "1.4rem",
              color: "#444",
            }}
          >
            📷 Φωτογραφίες Συνταγής ({recipePhotos.length})
          </h3>

          {photosLoading && (
            <div
              style={{ textAlign: "center", color: "#666", padding: "20px" }}
            >
              Φόρτωση φωτογραφιών...
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            {recipePhotos.map((photo) => (
              <PhotoThumbnail
                key={photo.id}
                photo={photo}
                onClick={openPhotoModal}
                size="200px"
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className={classes.tabContainer}>
        <button
          className={`${classes.tab} ${
            activeTab === "ingredients" ? classes.activeTab : ""
          }`}
          onClick={() => setActiveTab("ingredients")}
        >
          <span className={classes.tabIcon}>🛒</span>
          Υλικά ({recipe.recipeIngredients?.length || 0})
        </button>
        <button
          className={`${classes.tab} ${
            activeTab === "steps" ? classes.activeTab : ""
          }`}
          onClick={() => setActiveTab("steps")}
        >
          <span className={classes.tabIcon}>👨‍🍳</span>
          Βήματα ({recipe.steps?.length || 0})
        </button>
      </div>

      <div className={classes.tabContent}>
        {/* INGREDIENTS TAB */}
        {activeTab === "ingredients" && (
          <div className={classes.ingredientsSection}>
            {recipe.recipeIngredients && recipe.recipeIngredients.length > 0 ? (
              <div className={classes.ingredientsGrid}>
                {recipe.recipeIngredients.map((ing, index) => (
                  <div key={ing.id || index} className={classes.ingredientCard}>
                    <div className={classes.ingredientIcon}>🥄</div>
                    <div className={classes.ingredientDetails}>
                      <h4 className={classes.ingredientName}>{ing.name}</h4>
                      <div className={classes.ingredientQuantity}>
                        <span className={classes.quantity}>{ing.quantity}</span>
                        <span className={classes.unit}>
                          {ing.measurementUnit}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={classes.emptyState}>
                <div className={classes.emptyIcon}>📝</div>
                <h3>Δεν υπάρχουν υλικά</h3>
                <p>Δεν έχουν καταχωρηθεί υλικά για αυτή τη συνταγή.</p>
              </div>
            )}
          </div>
        )}

        {/* STEPS TAB */}
        {activeTab === "steps" && (
          <div className={classes.stepsSection}>
            {recipe.steps && recipe.steps.length > 0 ? (
              <div className={classes.stepsTimeline}>
                {recipe.steps
                  .sort((a, b) => a.stepOrder - b.stepOrder)
                  .map((step, index) => (
                    <div key={step.id} className={classes.stepCard}>
                      <div className={classes.stepNumber}>{step.stepOrder}</div>
                      <div className={classes.stepContent}>
                        <div className={classes.stepHeader}>
                          <h4 className={classes.stepTitle}>{step.title}</h4>
                          <div className={classes.stepMeta}>
                            <span className={classes.stepDuration}>
                              ⏱️ {step.duration} λεπτά
                            </span>
                          </div>
                        </div>

                        <p className={classes.stepDescription}>
                          {step.description}
                        </p>

                        {step.stepIngredients &&
                          step.stepIngredients.length > 0 && (
                            <div className={classes.stepIngredients}>
                              <h5>Υλικά βήματος:</h5>
                              <div className={classes.stepIngredientsList}>
                                {step.stepIngredients.map((ing, ingIndex) => (
                                  <span
                                    key={ingIndex}
                                    className={classes.stepIngredientTag}
                                  >
                                    {ing.quantity} {ing.measurementUnit}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* STEP PHOTOS */}
                        {stepPhotos[step.id] &&
                          stepPhotos[step.id].length > 0 && (
                            <div
                              style={{
                                marginTop: "15px",
                                paddingTop: "15px",
                                borderTop: "1px solid #e0e0e0",
                              }}
                            >
                              <h5
                                style={{
                                  margin: "0 0 10px 0",
                                  fontSize: "0.9rem",
                                  color: "#555",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                }}
                              >
                                📷 Φωτογραφίες βήματος (
                                {stepPhotos[step.id].length})
                              </h5>

                              <div
                                style={{
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fill, minmax(120px, 1fr))",
                                  gap: "10px",
                                }}
                              >
                                {stepPhotos[step.id].map((photo) => (
                                  <PhotoThumbnail
                                    key={photo.id}
                                    photo={photo}
                                    onClick={openPhotoModal}
                                    size="120px"
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                      </div>

                      {index < recipe.steps.length - 1 && (
                        <div className={classes.stepConnector}></div>
                      )}
                    </div>
                  ))}

                <div className={classes.stepsSummary}>
                  <div className={classes.summaryIcon}>⏱️</div>
                  <h4>Σύνοψη</h4>
                  <p>Συνολικός χρόνος βημάτων: {getTotalStepsTime()} λεπτά</p>
                </div>
              </div>
            ) : (
              <div className={classes.emptyState}>
                <div className={classes.emptyIcon}>👨‍🍳</div>
                <h3>Δεν υπάρχουν βήματα</h3>
                <p>
                  Δεν έχουν καταχωρηθεί βήματα εκτέλεσης για αυτή τη συνταγή.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PHOTO MODAL */}
      {selectedPhoto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={closePhotoModal}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              overflow: "hidden",
              maxWidth: "90vw",
              maxHeight: "90vh",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closePhotoModal}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(0,0,0,0.7)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "18px",
                cursor: "pointer",
                zIndex: 1001,
              }}
            >
              ✖
            </button>

            {/* Photo */}
            <img
              src={getPhotoImageUrl(selectedPhoto.id)}
              alt={selectedPhoto.description || "Photo"}
              style={{
                maxWidth: "80vw",
                maxHeight: "70vh",
                width: "auto",
                height: "auto",
              }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />

            {/* Fallback if image fails */}
            <div
              style={{
                display: "none",
                width: "500px",
                height: "400px",
                background: "#f5f5f5",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "10px" }}>📷</div>
              <div style={{ fontSize: "1.2rem", color: "#666" }}>
                Photo ID: {selectedPhoto.id}
              </div>
              <div
                style={{ fontSize: "0.9rem", color: "#999", marginTop: "5px" }}
              >
                Image not available
              </div>
            </div>

            {/* Photo description */}
            {selectedPhoto.description && (
              <div
                style={{
                  padding: "15px",
                  background: "#f8f9fa",
                  borderTop: "1px solid #e0e0e0",
                  textAlign: "center",
                }}
              >
                <strong>Περιγραφή:</strong> {selectedPhoto.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailsPage;
