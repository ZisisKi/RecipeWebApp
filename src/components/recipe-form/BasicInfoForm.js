import React from 'react';
import { Type, AlignLeft, Clock, Gauge, Utensils } from 'lucide-react';
import classes from './BasicInfoForm.module.css'; 

const BasicInfoForm = ({ formData, handleChange }) => {
    return (
        <div className={classes.container}>
            <h3 className={classes.title}>Βασικές Πληροφορίες</h3>
            
            <div className={classes.formGroup}>
                <label className={classes.label}>
                    <Type size={16} /> Όνομα Συνταγής:
                </label>
                <input 
                    className={classes.input} 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    minLength={2} 
                    maxLength={30}
                    placeholder="π.χ. Μοσχαράκι Κοκκινιστό"
                />
            </div>

            <div className={classes.formGroup}>
                <label className={classes.label}>
                    <AlignLeft size={16} /> Περιγραφή:
                </label>
                <textarea 
                    className={classes.textarea} 
                    name="description" 
                    maxLength={500} 
                    value={formData.description} 
                    onChange={handleChange}
                    placeholder="Γράψτε λίγα λόγια για τη συνταγή..."
                />
            </div>

            <div className={classes.row}>
                <div className={classes.formGroup}>
                    <label className={classes.label}>
                        <Clock size={16} /> Χρόνος (λεπτά):
                    </label>
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
                    <label className={classes.label}>
                        <Gauge size={16} /> Δυσκολία:
                    </label>
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
                    <label className={classes.label}>
                        <Utensils size={16} /> Κατηγορία:
                    </label>
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
        </div>
    );
};

export default BasicInfoForm;