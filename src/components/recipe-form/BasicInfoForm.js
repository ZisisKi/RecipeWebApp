import React from 'react';
// Import το δικό του CSS Module
import classes from './BasicInfoForm.module.css'; 

const BasicInfoForm = ({ formData, handleChange }) => {
    return (
        <div className={classes.container}>
            <h3 className={classes.title}>Βασικές Πληροφορίες</h3>
            
            <div className={classes.formGroup}>
                <label className={classes.label}>Όνομα:</label>
                <input 
                    className={classes.input} 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    minLength={2} 
                    maxLength={30}
                />
            </div>

            <div className={classes.formGroup}>
                <label className={classes.label}>Περιγραφή:</label>
                <textarea 
                    className={classes.textarea} 
                    name="description" 
                    maxLength={500} 
                    value={formData.description} 
                    onChange={handleChange}
                />
            </div>

            <div className={classes.formGroup}>
                <label className={classes.label}>Συνολικός Χρόνος (λεπτά):</label>
                <input 
                    className={classes.input} 
                    type="number" 
                    name="totalDuration" 
                    min="1" 
                    max="1440" 
                    value={formData.totalDuration} 
                    onChange={handleChange}
                />
            </div>

            <div className={classes.formGroup}>
                <label className={classes.label}>Δυσκολία:</label>
                <select 
                    className={classes.select} 
                    name="difficulty" 
                    value={formData.difficulty} 
                    onChange={handleChange}
                >
                    <option value="EASY">Εύκολο</option>
                    <option value="MEDIUM">Μέτριο</option>
                    <option value="HARD">Δύσκολο</option>
                </select>
            </div>

            <div className={classes.formGroup}>
                <label className={classes.label}>Κατηγορία:</label>
                <select 
                    className={classes.select} 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange}
                >
                    <option value="APPETIZER">Ορεκτικό</option>
                    <option value="MAIN_COURSE">Κυρίως Πιάτο</option>
                    <option value="DESSERT">Επιδόρπιο</option>
                    <option value="SALAD">Σαλάτα</option>
                    <option value="SNACK">Σνακ</option>
                </select>
            </div>
        </div>
    );
};

export default BasicInfoForm;