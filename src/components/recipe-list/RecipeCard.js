import React, { useEffect, useMemo, useState } from "react";
import classes from "./RecipeCard.module.css";
import {
  Clock,
  Salad,
  UtensilsCrossed,
  CakeSlice,
  Leaf,
  Popcorn,
  Sandwich,
  ChevronRight,
  Gauge,
  Image as ImageIcon,
} from "lucide-react";

import { getPhotosByRecipeId, getPhotoImageUrl } from "../../api/PhotoApi";

const getDifficultyClass = (diff) => {
  if (diff === "EASY") return classes.easy;
  if (diff === "MEDIUM") return classes.medium;
  return classes.hard;
};

const getDifficultyText = (difficulty) => {
  const texts = { EASY: "Εύκολο", MEDIUM: "Μέτριο", HARD: "Δύσκολο" };
  return texts[difficulty] || difficulty;
};

const getCategoryText = (category) => {
  const map = {
    APPETIZER: "Ορεκτικό",
    MAIN_COURSE: "Κυρίως",
    DESSERT: "Επιδόρπιο",
    SALAD: "Σαλάτα",
    SNACK: "Σνακ",
  };
  return map[category] || "Συνταγή";
};

const getCategoryIcon = (category) => {
  const map = {
    APPETIZER: <Salad size={16} />,
    MAIN_COURSE: <UtensilsCrossed size={16} />,
    DESSERT: <CakeSlice size={16} />,
    SALAD: <Leaf size={16} />,
    SNACK: <Popcorn size={16} />,
  };
  return map[category] || <Sandwich size={16} />;
};

const RecipeCard = ({ recipe, onClick }) => {
  const [coverPhotoId, setCoverPhotoId] = useState(null);

  const cacheKey = useMemo(() => `recipe_cover_${recipe?.id}`, [recipe?.id]);

  useEffect(() => {
    let cancelled = false;

    const loadCover = async () => {
      if (!recipe?.id) return;

      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        if (!cancelled) setCoverPhotoId(cached === "null" ? null : cached);
        return;
      }

      try {
        const photos = await getPhotosByRecipeId(recipe.id);
        const first = Array.isArray(photos) && photos.length > 0 ? photos[0] : null;
        const firstId = first?.id ? String(first.id) : null;

        sessionStorage.setItem(cacheKey, firstId ?? "null");
        if (!cancelled) setCoverPhotoId(firstId);
      } catch (e) {
        sessionStorage.setItem(cacheKey, "null");
        if (!cancelled) setCoverPhotoId(null);
      }
    };

    loadCover();
    return () => {
      cancelled = true;
    };
  }, [recipe?.id, cacheKey]);

  const handleClick = () => {
    if (onClick) onClick(recipe.id);
  };

  const handleError = () => setCoverPhotoId(null);

  const coverUrl = coverPhotoId ? getPhotoImageUrl(coverPhotoId) : "";

  return (
    <div className={classes.card} onClick={handleClick}>
      {/* Cover Image Section */}
      <div className={classes.cover}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={recipe.name}
            className={classes.coverImg}
            onError={handleError}
            loading="lazy"
          />
        ) : (
          <div className={classes.coverPlaceholder}>
            <ImageIcon size={32} />
            <span className={classes.coverText}>Χωρίς Εικόνα</span>
          </div>
        )}

        <div className={classes.coverTopRow}>
          <div className={classes.categoryPill}>
            {getCategoryIcon(recipe.category)}
            <span className={classes.categoryText}>
              {getCategoryText(recipe.category)}
            </span>
          </div>

          <div className={classes.timeBadge}>
            <Clock size={14} />
            <span>{recipe.totalDuration}'</span>
          </div>
        </div>

        <div className={classes.shine} aria-hidden="true" />
      </div>

      {/* Body Section */}
      <div className={classes.cardBody}>
        <h3 className={classes.title}>{recipe.name}</h3>

        {/* ΑΦΑΙΡΕΣΗ ΤΟΥ FALLBACK ΚΕΙΜΕΝΟΥ */}
        <p className={classes.description}>
          {recipe.description}
        </p>

        {/* Quick Stats Grid */}
        <div className={classes.quickStats}>
          <div className={classes.stat}>
            <span className={classes.statNumber}>
              {recipe.steps ? recipe.steps.length : 0}
            </span>
            <span className={classes.statText}>βήματα</span>
          </div>

          <div className={classes.statDivider} />

          <div className={classes.stat}>
            <span className={classes.statNumber}>
              {recipe.recipeIngredients ? recipe.recipeIngredients.length : 0}
            </span>
            <span className={classes.statText}>υλικά</span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className={classes.cardFooter}>
        <span
          className={`${classes.difficultyTag} ${getDifficultyClass(recipe.difficulty)}`}
        >
          <Gauge size={14} className={classes.gaugeIcon} />
          {getDifficultyText(recipe.difficulty)}
        </span>

        <span className={classes.viewAction}>
          Προβολή <ChevronRight size={16} />
        </span>
      </div>
    </div>
  );
};

export default RecipeCard;