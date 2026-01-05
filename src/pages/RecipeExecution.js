import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { getPhotosByStepId, getPhotoImageUrl } from "../api/PhotoApi";
import classes from "./RecipeExecution.module.css";

import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  ShoppingCart,
  PartyPopper,
} from "lucide-react";

const RecipeExecution = ({ recipe, onClose, onBackToMenu }) => {
  const steps = useMemo(
    () => recipe.steps?.slice().sort((a, b) => a.stepOrder - b.stepOrder) || [],
    [recipe.steps]
  );

  const totalDuration = recipe.totalDuration || 1;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepPhotos, setStepPhotos] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  
  const [viewer, setViewer] = useState({
    open: false,
    src: "",
    alt: "",
    index: 0,
    sources: [],
  });

  const currentStep = steps[currentStepIndex];

  const calculateProgress = () => {
    if (isFinished) return 100;
    let accumulatedTime = 0;
    for (let i = 0; i < currentStepIndex; i++) {
      accumulatedTime += steps[i].duration || 0;
    }
    const percent = (accumulatedTime / totalDuration) * 100;
    return Math.min(percent, 95);
  };

  const progressPercentage = calculateProgress();


  useEffect(() => {
    if (!currentStep) return;

    getPhotosByStepId(currentStep.id).then((photos) => {
      setStepPhotos(photos || []);
    });
  }, [currentStep]);


  const photoSources = useMemo(() => {
    return (stepPhotos || []).map((p) => getPhotoImageUrl(p.id));
  }, [stepPhotos]);

  const openViewer = (src, alt = "photo") => {
    const idx = Math.max(0, photoSources.indexOf(src));
    setViewer({
      open: true,
      src,
      alt,
      index: idx === -1 ? 0 : idx,
      sources: photoSources,
    });
  };

  const closeViewer = () =>
    setViewer({ open: false, src: "", alt: "", index: 0, sources: [] });


  useEffect(() => {
    const onKeyDown = (e) => {
      if (!viewer.open) return;

      if (e.key === "Escape") closeViewer();

      if (e.key === "ArrowRight" && viewer.sources.length > 1) {
        const next = (viewer.index + 1) % viewer.sources.length;
        setViewer((v) => ({
          ...v,
          index: next,
          src: v.sources[next],
        }));
      }

      if (e.key === "ArrowLeft" && viewer.sources.length > 1) {
        const prev = (viewer.index - 1 + viewer.sources.length) % viewer.sources.length;
        setViewer((v) => ({
          ...v,
          index: prev,
          src: v.sources[prev],
        }));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewer.open, viewer.index, viewer.sources]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      const scrollContainer = document.getElementById("inner-scroll");
      if (scrollContainer) scrollContainer.scrollTop = 0;
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
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
            Η συνταγή <strong>{recipe.name}</strong> ολοκληρώθηκε με επιτυχία.
            <br />
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

        <div style={{ width: "80px" }}></div>
      </div>

      
      <div className={classes.content}>
        <div className={classes.stepCardWrapper}>
          <div className={classes.cardInnerScroll} id="inner-scroll">
            <h2 className={classes.stepHeaderTitle}>
              {currentStep.stepOrder}. {currentStep.title}
            </h2>

            <div className={classes.stepMetaTag}>
              <Clock size={16} />
              <span>{currentStep.duration} λεπτά</span>
            </div>

            {photoSources.length > 0 && (
              <div className={classes.photosGrid}>
                {photoSources.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    className={classes.photoThumbBtn}
                    onClick={() => openViewer(src, `step photo ${idx + 1}`)}
                    aria-label="Άνοιγμα φωτογραφίας"
                  >
                    <img src={src} className={classes.stepPhoto} alt="step" />
                  </button>
                ))}
              </div>
            )}

            {currentStep.stepIngredients && currentStep.stepIngredients.length > 0 ? (
              <div className={classes.ingredientsBox}>
                <h4 className={classes.ingTitle}>
                  <ShoppingCart size={18} /> Υλικά Βήματος
                </h4>
                <ul className={classes.ingList}>
                  {currentStep.stepIngredients.map((ing, idx) => (
                    <li key={idx} className={classes.ingItem}>
                      <span>
                        <strong>
                          {ing.quantity} {ing.measurementUnit}
                        </strong>{" "}
                        {ing.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className={classes.description}>{currentStep.description}</div>
          </div>
        </div>
      </div>

      <div className={classes.footer}>
        <button
          className={classes.btnBack}
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          style={{
            opacity: currentStepIndex === 0 ? 0.3 : 1,
            cursor: currentStepIndex === 0 ? "default" : "pointer",
          }}
        >
          <ChevronLeft size={20} /> Πίσω
        </button>

        <button className={classes.btnNext} onClick={handleNext}>
          {currentStepIndex === steps.length - 1 ? (
            <>
              Ολοκλήρωση <CheckCircle2 size={20} />
            </>
          ) : (
            <>
              Επόμενο <ChevronRight size={20} />
            </>
          )}
        </button>
      </div>

      {viewer.open &&
        createPortal(
          <div
            className={classes.lightbox}
            onClick={closeViewer}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className={classes.lightboxClose}
              onClick={(e) => {
                e.stopPropagation();
                closeViewer();
              }}
              aria-label="Κλείσιμο"
            >
              <X size={18} />
            </button>

            <img
              className={classes.lightboxImg}
              src={viewer.src}
              alt={viewer.alt}
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

export default RecipeExecution;
