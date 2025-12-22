import React, { useState, useEffect } from "react";
import { getPhotosByStepId, getPhotoImageUrl } from "../api/PhotoApi";
import classes from "./RecipeExecution.module.css";

// Lucide Icons
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  ShoppingCart, 
  PartyPopper 
} from "lucide-react";

const RecipeExecution = ({ recipe, onClose, onBackToMenu }) => {
  const steps = recipe.steps?.sort((a, b) => a.stepOrder - b.stepOrder) || [];
  const totalDuration = recipe.totalDuration || 1;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepPhotos, setStepPhotos] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentStep = steps[currentStepIndex];

  const calculateProgress = () => {
    if (isFinished) return 100;
    let accumulatedTime = 0;
    for (let i = 0; i < currentStepIndex; i++) {
      accumulatedTime += (steps[i].duration || 0);
    }
    const percent = (accumulatedTime / totalDuration) * 100;
    return Math.min(percent, 95); 
  };

  const progressPercentage = calculateProgress();

  useEffect(() => {
    if (currentStep) {
      getPhotosByStepId(currentStep.id).then(photos => {
        setStepPhotos(photos || []);
      });
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      // Reset scroll position inside the card
      const scrollContainer = document.getElementById("inner-scroll");
      if (scrollContainer) scrollContainer.scrollTop = 0;
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  if (isFinished) {
    return (
      <div className={classes.completedOverlay}>
        <div className={classes.completedCard}>
          <div className={classes.congratsIcon}>
             <PartyPopper size={64} />
          </div>
          <h1 className={classes.completedTitle}>Συγχαρητήρια!</h1>
          <p className={classes.completedText}>
            Η συνταγή <strong>{recipe.name}</strong> ολοκληρώθηκε με επιτυχία.<br/>
            Καλή απόλαυση!
          </p>
          <div className={classes.completedButtons}>
            <button className={classes.btnMenu} onClick={onBackToMenu}>
              Επιστροφή στο Μενού
            </button>
            <button className={classes.btnReturn} onClick={onClose}>
              Κλείσιμο
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.overlay}>
      
      {/* Header */}
      <div className={classes.header}>
        <button className={classes.closeBtn} onClick={onClose}>
          <X size={18} /> Ακύρωση
        </button>
        
        <div className={classes.progressContainer}>
          <div className={classes.progressBarBg}>
            <div 
              className={classes.progressBarFill} 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <span className={classes.progressLabel}>
            ΠΡΟΟΔΟΣ {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div style={{width:'80px'}}></div>
      </div>

      {/* Main Content Area */}
      <div className={classes.content}>
        <div className={classes.stepCardWrapper}>
          
          {/* Scrollable Inner Section */}
          <div className={classes.cardInnerScroll} id="inner-scroll">
            <h2 className={classes.stepHeaderTitle}>
               {currentStep.stepOrder}. {currentStep.title}
            </h2>
            
            <div className={classes.stepMetaTag}>
               <Clock size={16} />
               <span>{currentStep.duration} λεπτά</span>
            </div>

            {/* Photos (Compact Row) */}
            {stepPhotos.length > 0 && (
              <div className={classes.photosGrid}>
                {stepPhotos.map(p => (
                  <img key={p.id} src={getPhotoImageUrl(p.id)} className={classes.stepPhoto} alt="step" />
                ))}
              </div>
            )}

            {/* Ingredients (Compact Grid) */}
            {currentStep.stepIngredients && currentStep.stepIngredients.length > 0 ? (
              <div className={classes.ingredientsBox}>
                <h4 className={classes.ingTitle}>
                   <ShoppingCart size={18}/> Υλικά Βήματος
                </h4>
                <ul className={classes.ingList}>
                  {currentStep.stepIngredients.map((ing, idx) => (
                    <li key={idx} className={classes.ingItem}>
                      <input type="checkbox" className={classes.checkbox} /> 
                      <span><strong>{ing.quantity} {ing.measurementUnit}</strong> {ing.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className={classes.description}>{currentStep.description}</div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className={classes.footer}>
        <button 
          className={classes.btnBack} 
          onClick={handlePrev} 
          disabled={currentStepIndex === 0}
          style={{ opacity: currentStepIndex === 0 ? 0.3 : 1, cursor: currentStepIndex === 0 ? 'default' : 'pointer' }}
        >
          <ChevronLeft size={20} /> Πίσω
        </button>

        <button className={classes.btnNext} onClick={handleNext}>
          {currentStepIndex === steps.length - 1 ? (
             <>Ολοκλήρωση <CheckCircle2 size={20}/></>
          ) : (
             <>Επόμενο <ChevronRight size={20}/></>
          )}
        </button>
      </div>
    </div>
  );
};

export default RecipeExecution;