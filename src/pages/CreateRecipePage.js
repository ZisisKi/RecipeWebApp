import classes from './CreateRecipePage.module.css';
import React, { useState } from 'react';
import { createRecipe } from '../api/recipeApi'; 
import IngredientSelector from '../components/IngredientSelector';

const CreateRecipePage = () => {

    // [STATE] Η καρδιά της φόρμας
    // Εδώ κρατάμε όλα τα δεδομένα που θα ταξιδέψουν προς το Backend.
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        difficulty: 'Εύκολο', // Default value (πρέπει να είναι κεφαλαία για το Enum)
        category: 'Πρωινό',
        totalDuration: 1,
        
        steps: [], // Θα το φτιάξουμε αργότερα
        photos: [], // Θα το φτιάξουμε αργότερα
        
        // [SOS BACKEND CONNECTION]
        // Η Java περιμένει μια λίστα: private List<RecipeIngredientDto> recipeIngredients;
        // Εδώ ξεκινάμε με άδεια λίστα [] και θα την γεμίσουμε δυναμικά.
        recipeIngredients: [] 
    });

    const [message, setMessage] = useState('');

    // [HANDLER] Για τα απλά πεδία (Όνομα, Περιγραφή κτλ)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // [NEW LOGIC - LIFTING STATE UP] 
    // Αυτή η συνάρτηση είναι το "αυτί" του Γονιού.
    // Την δίνουμε στο παιδί (IngredientSelector) και του λέμε:
    // "Όταν ο χρήστης πατήσει Προσθήκη, κάλεσε αυτή τη συνάρτηση και δώσε μου τα δεδομένα".
    const addIngredientToRecipe = (ingredientData) => {
        console.log("Ο Γονιός παρέλαβε:", ingredientData);

        // Ενημερώνουμε το state προσθέτοντας το νέο υλικό στην υπάρχουσα λίστα
        setFormData(prevData => ({
            ...prevData, // Κράτα τα παλιά (name, description...)
            recipeIngredients: [...prevData.recipeIngredients, ingredientData] // Πρόσθεσε το νέο στη λίστα
        }));
    };

    // [NEW LOGIC] Διαγραφή υλικού από τη λίστα (πριν την αποθήκευση)
    const removeIngredient = (indexToRemove) => {
        setFormData(prevData => ({
            ...prevData,
            // Φιλτράρουμε τη λίστα και κρατάμε όλα εκτός από αυτό που έχει το indexToRemove
            recipeIngredients: prevData.recipeIngredients.filter((_, index) => index !== indexToRemove)
        }));
    };

    // [SUBMIT] Η τελική αποστολή
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Έλεγχος αν ξέχασε να βάλει υλικά
        if (formData.recipeIngredients.length === 0) {
            alert("Παρακαλώ προσθέστε τουλάχιστον ένα υλικό!");
            return;
        }
        console.log("ΤΙ ΣΤΕΛΝΩ ΣΤΟ BACKEND:", JSON.stringify(formData, null, 2));
        try {
            // Στέλνουμε ΟΛΟ το πακέτο (μαζί με τη λίστα υλικών) στο Backend
            const savedRecipe = await createRecipe(formData);
            setMessage(`Επιτυχία! Η συνταγή "${savedRecipe.name}" δημιουργήθηκε.`);
            
            // Προαιρετικά: Καθαρίζουμε τη φόρμα για νέα συνταγή
            // setFormData({ ...αρχικές τιμές... })
        } catch (error) {
            console.error(error);
            setMessage('Σφάλμα κατά την αποθήκευση.');
        }
    };

    return (
        <div className={classes.container}>
            <h1 className={classes.title}>Δημιουργία Νέας Συνταγής</h1>
            
            <form onSubmit={handleSubmit}>
                
                {/* --- ΤΑ ΒΑΣΙΚΑ ΠΕΔΙΑ --- */}
                <div className={classes.formGroup}>
                    <label className={classes.label}>Όνομα:</label>
                    <input className={classes.input} type="text" name="name" minLength={2} maxLength={30} value={formData.name} onChange={handleChange} required />
                </div>

                <div className={classes.formGroup}>
                    <label className={classes.label}>Περιγραφή:</label>
                    <textarea className={classes.textarea} name="description" maxLength={500} value={formData.description} onChange={handleChange} />
                </div>

                <div className={classes.formGroup}>
                    <label className={classes.label}>Χρόνος (λεπτά):</label>
                    <input className={classes.input} type="number" name="totalDuration" min="1" max="1440" value={formData.totalDuration} onChange={handleChange} />
                </div>

                <div className={classes.formGroup}>
                    <label className={classes.label}>Δυσκολία:</label>
                    <select className={classes.select} name="difficulty" value={formData.difficulty} onChange={handleChange}>
                        <option value="Εύκολο">Εύκολο</option>
                        <option value="Μέτριο">Μέτριο</option>
                        <option value="Δύσκολο">Δύσκολο</option>
                    </select>
                </div>

                 <div className={classes.formGroup}>
                    <label className={classes.label}>Κατηγορία:</label>
                    <select className={classes.select} name="category" value={formData.category} onChange={handleChange}>
                        <option value="Ορεκτικό">Ορεκτικό</option>
                        <option value="Κυρίως Πιάτο">Κυρίως Πιάτο</option>
                        <option value="Επιδόρπιο">Επιδόρπιο</option>
                        <option value="Σαλάτα">Σαλάτα</option>
                        <option value="Σνακ">Σνακ</option>
                    </select>
                </div>

                <hr style={{ margin: '2rem 0', border: '0', borderTop: '1px solid #ccc' }} />
                
                {/* --- [SECTION] ΛΙΣΤΑ ΥΛΙΚΩΝ (Preview) --- */}
                {/* Εδώ δείχνουμε στον χρήστη τι έχει προσθέσει μέχρι στιγμής */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{color: '#2c3e50'}}>Υλικά Συνταγής ({formData.recipeIngredients.length})</h3>
                    
                    {formData.recipeIngredients.length === 0 ? (
                        <p style={{ color: '#888', fontStyle: 'italic' }}>Δεν έχουν προστεθεί υλικά ακόμα.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {/* Κάνουμε MAP τη λίστα των υλικών που έχουμε στο state */}
                            {formData.recipeIngredients.map((item, index) => (
                                <li key={index} style={{ 
                                    background: '#f8f9fa', padding: '10px', marginBottom: '8px', 
                                    border: '1px solid #e9ecef', borderRadius: '8px', 
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                                }}>
                                    <span style={{ fontWeight: '500' }}>
                                        {/* Εμφανίζουμε: Ντομάτα - 500 GRAMS */}
                                        {item.name} <span style={{color:'#666'}}>— {item.quantity} {item.measurementUnit}</span>
                                    </span>
                                    
                                    {/* Κουμπί Διαγραφής (X) */}
                                    <button 
                                        type="button" 
                                        onClick={() => removeIngredient(index)}
                                        style={{ 
                                            background: '#ff6b6b', color: 'white', border: 'none', 
                                            borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', fontWeight: 'bold' 
                                        }}
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* --- [SECTION] ΤΟ ΕΡΓΑΛΕΙΟ ΠΡΟΣΘΗΚΗΣ (CHILD COMPONENT) --- */}
                {/* Περνάμε τη συνάρτηση addIngredientToRecipe ως prop με όνομα 'onAdd' */}
                <IngredientSelector onAdd={addIngredientToRecipe} />

                <br/>
                <button className={classes.submitBtn} type="submit">Αποθήκευση Συνταγής</button>
            </form>

            {message && <p style={{marginTop: '1rem', fontWeight: 'bold', color: message.includes('Επιτυχία') ? 'green' : 'red'}}>{message}</p>}
        </div>
    );
};

export default CreateRecipePage;