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
import RecipeExecution from "./RecipeExecution"; 

import { useConfirm } from "../components/UI/ConfirmProvider";
import { useToast } from "../components/UI/ToastProvider";

import classes from "./RecipeDetailsPage.module.css";

const RecipeDetailsPage = ({ recipeId, onEdit, onBack }) => {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const confirmDialog = useConfirm();
   const showToast = useToast();

   const UNIT_LABELS = {
  "κομμάτια": { singular: "κομμάτι", plural: "κομμάτια" },
  "γραμμάρια": { singular: "γραμμάριο", plural: "γραμμάρια" },
  "ml": { singular: "ml", plural: "ml" },
  "κουταλιές σούπας": { singular: "κουταλιά σούπας", plural: "κουταλιές σούπας" },
  "κουταλάκια γλυκού": { singular: "κουταλάκι γλυκού", plural: "κουταλάκια γλυκού" },
  "πρέζες": { singular: "πρέζα", plural: "πρέζες" },
  "φέτες": { singular: "φέτα", plural: "φέτες" },
  "φλιτζάνια": { singular: "φλιτζάνι", plural: "φλιτζάνια" },
  "λίτρα": { singular: "λίτρο", plural: "λίτρα" },
  "κιλά": { singular: "κιλό", plural: "κιλά" },
};

const formatUnit = (quantity, unit) => {
  const entry = UNIT_LABELS[unit];
  if (!entry) return unit;
  return quantity === 1 ? entry.singular : entry.plural;
};



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
  const ok = await confirmDialog({
    title: "Διαγραφή συνταγής",
    message: "Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη συνταγή;",
    confirmText: "Ναι, διαγραφή",
    cancelText: "Ακύρωση",
  });

  if (!ok) return;

  try {
    await deleteRecipe(recipeId);
    onBack();
  } catch (err) {
          showToast({
  type: "error",
  title: "Σφάλμα",
  message: error?.message ? `Σφάλμα: ${error.message}` : "Κάτι πήγε στραβά.",
});
  }
};


  const getDifficultyClass = (diff) => {
    if (diff === "EASY") return classes.easy;
    if (diff === "MEDIUM") return classes.medium;
    return classes.hard;
  };
  
  const getDifficultyText = (diff) => {
     const texts = { EASY: "Εύκολο", MEDIUM: "Μέτριο", HARD: "Δύσκολο" };
     return texts[diff] || diff;
  };

  if (loading) return <div className={classes.container}>Φόρτωση...</div>;
  if (error) return <div className={classes.container}>{error}</div>;
  if (!recipe) return <div className={classes.container}>Η συνταγή δεν βρέθηκε.</div>;

  // --- EXECUTION MODE ---
  if (isExecuting) {
    return (
      <RecipeExecution 
        recipe={recipe} 
        onClose={() => setIsExecuting(false)} 
        onBackToMenu={onBack}
      />
    );
  }

  // --- VIEW MODE ---
  const coverImage = recipe.photos && recipe.photos.length > 0 
    ? getPhotoImageUrl(recipe.photos[0].id) 
    : null;

    const pluralize = (count, singular, plural) => (count === 1 ? singular : plural);


  return (
    <div className={classes.container}>
      
      {/* HEADER SECTION */}
      <div className={classes.headerSection}>
        {/* Actions Bar */}
        <div className={classes.topActionBar}>
           <button className={`${classes.actionBtn} ${classes.btnExecute}`} onClick={() => setIsExecuting(true)}>
             <PlayCircle size={18} /> Εκτέλεση
           </button>
           <button className={`${classes.actionBtn} ${classes.btnEdit}`} onClick={onEdit}>
             <Pencil size={18} /> Επεξεργασία
           </button>
           <button className={`${classes.actionBtn} ${classes.btnDelete}`} onClick={handleDelete}>
             <Trash2 size={18} /> Διαγραφή
           </button>
        </div>

        <div className={classes.heroImageContainer}>
          {coverImage ? (
            <img src={coverImage} alt={recipe.name} className={classes.heroImage} />
          ) : (
            <div className={classes.heroPlaceholder}>
              <ImageIcon size={64} style={{ opacity: 0.5 }} />
              <p>Χωρίς Φωτογραφία</p>
            </div>
          )}
          
          <div className={classes.heroOverlay}>
             <h1 className={classes.title}>{recipe.name}</h1>
             <p className={classes.description}>
               {recipe.description || "Δεν υπάρχει περιγραφή."}
             </p>
          </div>
        </div>
      </div>

      {/* META BAR */}
      <div className={classes.metaBar}>
        <div className={classes.metaItem}>
          <div className={classes.metaIconWrapper}><Clock size={20} /></div>
          <span>
  {recipe.totalDuration} {recipe.totalDuration === 1 ? "λεπτό" : "λεπτά"}
</span>

        </div>

        {recipe.portions && (
            <div className={classes.metaItem}>
            <div className={classes.metaIconWrapper}><Users size={20} /></div>
            <span>
  {recipe.portions} {recipe.portions === 1 ? "Μερίδα" : "Μερίδες"}
</span>

            </div>
        )}

        <div className={classes.metaItem}>
          <div className={classes.metaIconWrapper}><Gauge size={20} /></div>
          <span className={`${classes.difficultyTag} ${getDifficultyClass(recipe.difficulty)}`}>
            {getDifficultyText(recipe.difficulty)}
          </span>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className={classes.contentGrid}>
        
        {/* Left Column: Ingredients */}
        <div className={classes.sectionCard}>
          <div className={classes.sectionHeader}>
            <ChefHat size={24} color="#fbbf24" />
            <h3 className={classes.sectionTitle}>Υλικά</h3>
          </div>
          
          <ul className={classes.ingredientsList}>
            {recipe.recipeIngredients && recipe.recipeIngredients.length > 0 ? (
              recipe.recipeIngredients.map((ing, index) => (
                <li key={index} className={classes.ingredientItem}>
                  <CheckCircle2 size={18} className={classes.checkIcon} />
                  <span>
                   <strong>
  {ing.quantity} {formatUnit(ing.quantity, ing.measurementUnit)}
</strong>{" "}
{ing.name || (ing.ingredient && ing.ingredient.name)}

                  </span>
                </li>
              ))
            ) : (
              <p>Δεν έχουν καταχωρηθεί υλικά.</p>
            )}
          </ul>
        </div>

        {/* Right Column: Steps */}
        <div className={classes.sectionCard}>
          <div className={classes.sectionHeader}>
            <ListOrdered size={24} color="#fbbf24" />
            <h3 className={classes.sectionTitle}>Εκτέλεση</h3>
          </div>

          <div className={classes.stepsList}>
            {recipe.steps && recipe.steps.length > 0 ? (
              recipe.steps
                .sort((a, b) => a.stepOrder - b.stepOrder)
                .map((step, index) => (
                  <div key={index} className={classes.stepItem}>
                    
                    <div className={classes.stepHeaderLine}>
                       <div className={classes.stepNumber}>{index + 1}</div>
                       <h4 className={classes.stepTitleText}>{step.title}</h4>
                       <span className={classes.stepDurationBadge}>{step.duration}'</span>
                    </div>
                    
                    <div className={classes.stepContent}>
                      <p className={classes.stepText}>{step.description}</p>
                      
                      {step.stepIngredients && step.stepIngredients.length > 0 && (
                        <div className={classes.stepIngredientsList}>
                          <span className={classes.stepIngLabel}>Υλικά Βήματος:</span>
                          {step.stepIngredients.map((ing, i) => (
                            <span key={i} className={classes.stepIngPill}>
                              {ing.quantity} {ing.measurementUnit} {ing.name || (ing.ingredient && ing.ingredient.name)}
                            </span>
                          ))}
                        </div>
                      )}

                      {step.photos && step.photos.length > 0 && (
                         <div className={classes.stepPhotosRow}>
                            {step.photos.map(p => (
                               <img 
                                 key={p.id} 
                                 src={getPhotoImageUrl(p.id)} 
                                 className={classes.stepPhotoImg} 
                                 alt="Step visual" 
                               />
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
      <div className={classes.sectionCard} style={{ marginTop: '30px' }}>
        <div className={classes.sectionHeader}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <ImageIcon size={24} color="#fbbf24" />
             <h3 className={classes.sectionTitle}>Φωτογραφίες Συνταγής</h3>
          </div>
        </div>
        
        <PhotoGallery 
           recipeId={recipeId} 
           allowDelete={false} 
        />
      </div>

    </div>
  );
};

export default RecipeDetailsPage;