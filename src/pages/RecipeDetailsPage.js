import React, { useEffect, useState } from "react";
// Lucide Icons
import { 
  Clock, 
  Users, 
  Gauge, 
  ChefHat, 
  ListOrdered, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  Image as ImageIcon,
  PlayCircle 
} from "lucide-react";

import { getRecipeById, deleteRecipe } from "../api/recipeApi";
import { getPhotoImageUrl } from "../api/PhotoApi"; 

// Components
import PhotoGallery from "../components/UI/PhotoGallery"; 

// *** ΔΙΟΡΘΩΣΗ ΕΔΩ ***
import RecipeExecution from "./RecipeExecution"; // Import από τον ίδιο φάκελο (pages)

import styles from "./RecipeDetailsPage.module.css";

const RecipeDetailsPage = ({ recipeId, onEdit, onBack }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false); // State για το Mode Εκτέλεσης

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const data = await getRecipeById(recipeId);
        setRecipe(data);
      } catch (err) {
        setError("Η φόρτωση της συνταγής απέτυχε.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [recipeId]);

  const handleDelete = async () => {
    if (window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη συνταγή;")) {
      try {
        await deleteRecipe(recipeId);
        onBack(); // Επιστροφή στη λίστα
      } catch (err) {
        alert("Σφάλμα κατά τη διαγραφή.");
      }
    }
  };

  const getDifficultyClass = (diff) => {
    if (diff === "EASY") return styles.easy;
    if (diff === "MEDIUM") return styles.medium;
    return styles.hard;
  };
  
  const getDifficultyText = (diff) => {
     const texts = { EASY: "Εύκολο", MEDIUM: "Μέτριο", HARD: "Δύσκολο" };
     return texts[diff] || diff;
  };

  if (loading) return <div className={styles.container}>Φόρτωση...</div>;
  if (error) return <div className={styles.container}>{error}</div>;
  if (!recipe) return <div className={styles.container}>Η συνταγή δεν βρέθηκε.</div>;

  // --- 1. EXECUTION MODE ---
  if (isExecuting) {
    return (
      <RecipeExecution 
        recipe={recipe} 
        onClose={() => setIsExecuting(false)} 
        onBackToMenu={onBack}
      />
    );
  }

  // --- 2. VIEW MODE ---
  // Βρίσκουμε την εικόνα εξωφύλλου (την πρώτη από τη λίστα)
  const coverImage = recipe.photos && recipe.photos.length > 0 
    ? getPhotoImageUrl(recipe.photos[0].id) 
    : null;

  return (
    <div className={styles.container}>
      
      {/* HERO SECTION */}
      <div className={styles.heroSection}>
        <div className={styles.heroImageContainer}>
          {coverImage ? (
            <img src={coverImage} alt={recipe.name} className={styles.heroImage} />
          ) : (
            <div className={styles.heroPlaceholder}>
              <ImageIcon size={64} style={{ opacity: 0.5 }} />
              <p>Χωρίς Φωτογραφία</p>
            </div>
          )}
          
          <div className={styles.heroOverlay}>
             <h1 className={styles.title}>{recipe.name}</h1>
             <p className={styles.description}>
               {recipe.description || "Δεν υπάρχει περιγραφή."}
             </p>
          </div>
        </div>
      </div>

      {/* META BAR */}
      <div className={styles.metaBar}>
        <div className={styles.metaItem}>
          <div className={styles.metaIconWrapper}><Clock size={20} /></div>
          <span>{recipe.totalDuration} λεπτά</span>
        </div>

        {recipe.portions && (
            <div className={styles.metaItem}>
            <div className={styles.metaIconWrapper}><Users size={20} /></div>
            <span>{recipe.portions} Μερίδες</span>
            </div>
        )}

        <div className={styles.metaItem}>
          <div className={styles.metaIconWrapper}><Gauge size={20} /></div>
          <span className={`${styles.difficultyTag} ${getDifficultyClass(recipe.difficulty)}`}>
            {getDifficultyText(recipe.difficulty)}
          </span>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className={styles.contentGrid}>
        
        {/* Ingredients Column */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <ChefHat size={24} color="#fbbf24" />
            <h3 className={styles.sectionTitle}>Υλικά</h3>
          </div>
          
          <ul className={styles.ingredientsList}>
            {recipe.recipeIngredients && recipe.recipeIngredients.length > 0 ? (
              recipe.recipeIngredients.map((ing, index) => (
                <li key={index} className={styles.ingredientItem}>
                  <CheckCircle2 size={18} className={styles.checkIcon} />
                  <span>
                    <strong>{ing.quantity} {ing.measurementUnit}</strong> {ing.name}
                  </span>
                </li>
              ))
            ) : (
              <p>Δεν έχουν καταχωρηθεί υλικά.</p>
            )}
          </ul>
        </div>

        {/* Steps Column */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <ListOrdered size={24} color="#fbbf24" />
            <h3 className={styles.sectionTitle}>Εκτέλεση</h3>
          </div>

          <div className={styles.stepsList}>
            {recipe.steps && recipe.steps.length > 0 ? (
              recipe.steps
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((step, index) => (
                  <div key={index} className={styles.stepItem}>
                    <div className={styles.stepNumber}>{index + 1}</div>
                    
                    <div className={styles.stepContent}>
                      <p className={styles.stepText}>{step.description}</p>
                      
                      {/* Υλικά Βήματος (Tags) */}
                      {step.stepIngredients && step.stepIngredients.length > 0 && (
                        <div className={styles.stepIngredientsList}>
                          <span className={styles.stepIngLabel}>Υλικά:</span>
                          {step.stepIngredients.map((ing, i) => (
                            <span key={i} className={styles.stepIngPill}>
                              {ing.quantity} {ing.measurementUnit} {ing.name || (ing.ingredient && ing.ingredient.name)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
            ) : (
              <p>Δεν υπάρχουν βήματα εκτέλεσης.</p>
            )}
          </div>
        </div>
      </div>

      {/* PHOTO GALLERY SECTION */}
      <div className={styles.sectionCard} style={{ marginTop: '30px' }}>
        <div className={styles.sectionHeader}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <ImageIcon size={24} color="#fbbf24" />
             <h3 className={styles.sectionTitle}>Φωτογραφίες Συνταγής</h3>
          </div>
        </div>
        
        <PhotoGallery 
           recipeId={recipeId} 
           allowDelete={false} // View Mode
        />
      </div>

      {/* ACTIONS BAR */}
      <div className={styles.actionBar}>
        {/* Κουμπί Εκτέλεσης */}
        <button className={`${styles.actionBtn} ${styles.btnExecute}`} onClick={() => setIsExecuting(true)}>
          <PlayCircle size={20} />
          Ξεκίνα Μαγείρεμα!
        </button>

        <button className={`${styles.actionBtn} ${styles.btnEdit}`} onClick={onEdit}>
          <Pencil size={18} />
          Επεξεργασία
        </button>
        <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={handleDelete}>
          <Trash2 size={18} />
          Διαγραφή
        </button>
      </div>

    </div>
  );
};

export default RecipeDetailsPage;