import React, { useState } from "react";

// --- Icons (Lucide React) ---
import { ChefHat, BookOpen, PlusCircle } from "lucide-react";

// --- Imports Σελίδων ---
import CreateRecipePage from "./pages/CreateRecipePage";
import RecipeListPage from "./pages/RecipeListPage";
import RecipeDetailsPage from "./pages/RecipeDetailsPage";
import EditRecipe from "./pages/EditPage/EditRecipe";

// --- UI Components ---
import BackButton from "./components/UI/BackButton";

// --- CSS ---
import classes from "./App.module.css";

function App() {
  // --- STATE ---
  const [activeScreen, setActiveScreen] = useState("Welcome");
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // --- HANDLERS (Navigation) ---
  const goToMenu = () => {
    setActiveScreen("Welcome");
    setSelectedRecipeId(null);
  };

  const handleRecipeSelection = (id) => {
    setSelectedRecipeId(id);
    setActiveScreen("Recipe_Details");
  };

  const handleEditRequest = () => {
    setActiveScreen("Edit_Recipe");
  };

  const handleEditComplete = () => {
    setActiveScreen("Recipe_Details");
  };

  // --- RENDER ---
  return (
    <div className={classes.appContainer}>
      {/* HEADER */}
      <header className={classes.header}>
        <h1 className={classes.appTitle} onClick={goToMenu}>
          {/* ΑΛΛΑΓΗ 1: Lucide Icon αντί για Emoji */}
          <ChefHat
            size={36}
            color="#fbbf24"
            strokeWidth={2.5}
            style={{ marginRight: "12px" }}
          />
          Recipe eBook
        </h1>
      </header>

      <main className={classes.mainContent}>
        {/* --- 1. WELCOME SCREEN --- */}
        {activeScreen === "Welcome" && (
          <div className={classes.heroSplitSection}>
            <div className={classes.heroBgLeft}></div>
            <div className={classes.heroBgRight}></div>
            <div className={classes.heroDivider}></div>

            <div className={classes.heroContent}>
              <h2 className={classes.heroHeadline}>
                Μια εφαρμογή Συνταγών
                <br /> για όλες τις Κουζίνες
              </h2>
              <p className={classes.heroSubHeadline}>
                Δημιούργησε! <br />
                Αποθήκευσε! <br />
                Εκτέλεσε!
              </p>

              <nav className={classes.mainMenu}>
                <button
                  className={`${classes.menuBtn} ${classes.btnView}`}
                  onClick={() => setActiveScreen("Recipe_List")}
                >
                  {/* ΑΛΛΑΓΗ 2: Lucide Icon */}
                  <BookOpen size={24} />
                  Προβολή Συνταγών
                </button>
                <button
                  className={`${classes.menuBtn} ${classes.btnCreate}`}
                  onClick={() => setActiveScreen("Create_Recipe")}
                >
                  {/* ΑΛΛΑΓΗ 2: Lucide Icon */}
                  <PlusCircle size={24} />
                  Νέα Συνταγή
                </button>
              </nav>
            </div>
          </div>
        )}

        {/* --- 2. RECIPE LIST SCREEN --- */}
        {activeScreen === "Recipe_List" && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              {/* ΑΛΛΑΓΗ 3: Αφαίρεση του "←" από το text */}
              <BackButton onClick={goToMenu} text="Πίσω στο Μενού" />
            </div>
            <RecipeListPage onRecipeClick={handleRecipeSelection} />
          </div>
        )}

        {/* --- 3. CREATE RECIPE SCREEN --- */}
        {activeScreen === "Create_Recipe" && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              <BackButton onClick={goToMenu} text="Πίσω στο Μενού" />
            </div>
            <CreateRecipePage />
          </div>
        )}

        {/* --- 4. RECIPE DETAILS SCREEN --- */}
        {activeScreen === "Recipe_Details" && selectedRecipeId && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
              <BackButton
                onClick={() => setActiveScreen("Recipe_List")}
                text="Πίσω στη Λίστα"
              />
            </div>

            <RecipeDetailsPage
              recipeId={selectedRecipeId}
              onEdit={handleEditRequest}
              onBack={() => setActiveScreen("Recipe_List")}
            />
          </div>
        )}

        {/* --- 5. EDIT RECIPE SCREEN --- */}
        {activeScreen === "Edit_Recipe" && selectedRecipeId && (
          <div className={classes.pageWrapper}>
            {/* Εδώ δεν βάζουμε Header/BackButton γιατί υπάρχει το κουμπί "Έξοδος" μέσα στο EditRecipe */}
            <EditRecipe
              recipeId={selectedRecipeId}
              onCancel={handleEditComplete}
              onSaveSuccess={handleEditComplete}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={classes.footer}>
        <div className={classes.footerContent}>
          <span>© 2025 Recipe eBook Project</span>
          <span className={classes.footerSeparator}>|</span>
          <span className={classes.footerTeam}>
            Powered by: <strong>Alex / Zisis / Stelios / Argiris</strong>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
