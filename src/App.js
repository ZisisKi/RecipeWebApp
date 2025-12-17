import React, { useState } from 'react';
// Προσοχή: Βεβαιώσου ότι τα paths για τα imports είναι σωστά
import CreateRecipePage from './pages/CreateRecipePage';
import RecipeListPage from './pages/RecipeListPage';
import classes from './App.module.css';

function App() {
  // Αρχική κατάσταση: 'Welcome' για να δείχνουμε την αρχική σελίδα
  const [activeScreen, setActiveScreen] = useState('Welcome');

  const goToMenu = () => {
    setActiveScreen('Welcome');
  };

  return (
    <div className={classes.appContainer}>
      {/* HEADER: Πάντα ορατό, με τον τίτλο της εφαρμογής */}
      <header className={classes.header}>
        <h1 className={classes.appTitle} onClick={goToMenu}>🍴 Recipe eBook</h1>
      </header>

      <main className={classes.mainContent}>
        {/* --- WELCOME SCREEN (Η Αρχική Σελίδα) --- */}
        {activeScreen === 'Welcome' && (
          <div className={classes.heroSection}>
             {/* Μια ωραία εικόνα φαγητού για background */}
            <div className={classes.heroImagePlaceholder}>
                <h2 className={classes.heroText}>Οι καλύτερες συνταγές, συγκεντρωμένες.</h2>
            </div>
            
            {/* Το κεντρικό μενού επιλογών */}
            <nav className={classes.mainMenu}>
              <button 
                className={`${classes.menuBtn} ${classes.btnView}`}
                onClick={() => setActiveScreen('Recipe_List')}
              >
                 📖 Προβολή Συνταγών
              </button>
              <button 
                className={`${classes.menuBtn} ${classes.btnCreate}`}
                onClick={() => setActiveScreen('Create_Recipe')}
              >
                 🍳 Νέα Συνταγή
              </button>
            </nav>
          </div>
        )}

        {/* --- ΟΙ ΥΠΟΛΟΙΠΕΣ ΣΕΛΙΔΕΣ --- */}
        {activeScreen === 'Recipe_List' && (
          <div className={classes.pageWrapper}>
             {/* Κουμπί επιστροφής με ωραίο στυλ */}
            <div className={classes.navigationHeader}>
              <button className={classes.backBtn} onClick={goToMenu}>← Πίσω στο Μενού</button>
            </div>
            <RecipeListPage />
          </div>
        )}

        {activeScreen === 'Create_Recipe' && (
          <div className={classes.pageWrapper}>
            <div className={classes.navigationHeader}>
               <button className={classes.backBtn} onClick={goToMenu}>← Πίσω στο Μενού</button>
            </div>
            <CreateRecipePage />
          </div>
        )}
      </main>
      
      {/* FOOTER: Για επαγγελματικό φινίρισμα */}
      <footer className={classes.footer}>
        © 2025 My Recipe eBook Project
      </footer>
    </div>
  );
}

export default App;