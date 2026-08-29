require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize SQLite Database
const dbPath = process.env.DOCKER_ENV === 'true' 
    ? '/app/data/medicines.db' 
    : path.join(__dirname, 'medicines.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.run(`CREATE TABLE IF NOT EXISTS medicines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        dosage TEXT,
        time TEXT NOT NULL,
        description TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        }
    });
}

// --- REST APIs ---

// GET: Fetch all medicines
app.get('/medicines', (req, res) => {
    db.all('SELECT * FROM medicines ORDER BY time ASC', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to fetch medicines' });
        } else {
            res.status(200).json(rows);
        }
    });
});

// POST: Add new medicine
app.post('/addMedicine', (req, res) => {
    const { name, dosage, time, description } = req.body;
    if (!name || !time) return res.status(400).json({ error: 'Name and time are required' });

    db.run(
        'INSERT INTO medicines (name, dosage, time, description) VALUES (?, ?, ?, ?)',
        [name, dosage || '', time, description || ''],
        function(err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to add medicine' });
            } else {
                res.status(201).json({ id: this.lastID, message: 'Medicine added successfully' });
            }
        }
    );
});

// DELETE: Remove a medicine
app.delete('/medicine/:id', (req, res) => {
    db.run('DELETE FROM medicines WHERE id = ?', [req.params.id], function(err) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete medicine' });
        } else {
            res.status(200).json({ message: 'Medicine deleted successfully' });
        }
    });
});

// PUT: Update medicine details
app.put('/medicine/:id', (req, res) => {
    const { name, dosage, time, description } = req.body;
    if (!name || !time) return res.status(400).json({ error: 'Name and time are required' });

    db.run(
        'UPDATE medicines SET name = ?, dosage = ?, time = ?, description = ? WHERE id = ?',
        [name, dosage || '', time, description || '', req.params.id],
        function(err) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to update medicine' });
            } else {
                res.status(200).json({ message: 'Medicine updated successfully' });
            }
        }
    );
});

// Local medicine explanation database
const medicineExplanations = {
    'aspirin': 'Aspirin is a pain reliever and anti-inflammatory medication. It helps reduce fever, pain, and swelling. It\'s commonly used for headaches, muscle aches, and arthritis.',
    'ibuprofen': 'Ibuprofen is a nonsteroidal anti-inflammatory drug (NSAID). It reduces pain, inflammation, and fever. Commonly used for headaches, toothaches, menstrual cramps, and minor injuries.',
    'paracetamol': 'Paracetamol (acetaminophen) is a pain reliever and fever reducer. It\'s used for mild to moderate pain and fever. Unlike aspirin, it doesn\'t reduce inflammation.',
    'acetaminophen': 'Acetaminophen (paracetamol) is a pain reliever and fever reducer. It\'s used for mild to moderate pain and fever. Unlike aspirin, it doesn\'t reduce inflammation.',
    'amoxicillin': 'Amoxicillin is an antibiotic used to treat bacterial infections. It belongs to the penicillin family and treats ear infections, pneumonia, and other bacterial illnesses.',
    'metformin': 'Metformin is a medication for type 2 diabetes. It helps control blood sugar levels by improving insulin sensitivity and reducing glucose production in the liver.',
    'lisinopril': 'Lisinopril is used to treat high blood pressure and heart failure. It\'s an ACE inhibitor that relaxes blood vessels, making it easier for the heart to pump blood.',
    'atorvastatin': 'Atorvastatin is a cholesterol-lowering medication. It reduces LDL (bad) cholesterol and triglycerides in the blood, helping prevent heart disease and stroke.',
    'omeprazole': 'Omeprazole is used to treat acid reflux and stomach ulcers. It reduces stomach acid production, providing relief from heartburn and indigestion.',
    'vitamin d': 'Vitamin D helps the body absorb calcium and phosphorus for strong bones and teeth. It supports immune function and overall health.',
    'vitamin c': 'Vitamin C is an antioxidant that supports immune function. It helps the body absorb iron and promotes wound healing and skin health.',
    'vitamin b12': 'Vitamin B12 is essential for red blood cell formation and nerve function. It helps prevent anemia and supports brain health.',
    'prednisone': 'Prednisone is a corticosteroid that reduces inflammation and suppresses the immune system. It\'s used to treat allergies, asthma, arthritis, and autoimmune conditions.',
    'warfarin': 'Warfarin is an anticoagulant (blood thinner). It prevents blood clots and is used to treat or prevent stroke, heart attack, and deep vein thrombosis.',
    'insulin': 'Insulin is a hormone that regulates blood sugar levels. It\'s used to treat diabetes by helping the body use glucose for energy.',
    'levothyroxine': 'Levothyroxine is a thyroid hormone replacement. It treats hypothyroidism (underactive thyroid) by restoring normal thyroid hormone levels.',
    'albuterol': 'Albuterol is a bronchodilator used to treat asthma and COPD. It relaxes muscles in the airways, making breathing easier during asthma attacks.',
    'gabapentin': 'Gabapentin is used to treat nerve pain and seizures. It affects neurotransmitters to reduce pain signals and prevent epileptic seizures.',
    'hydrochlorothiazide': 'Hydrochlorothiazide is a diuretic (water pill) that treats high blood pressure and fluid retention. It helps the body eliminate excess salt and water.',
    'furosemide': 'Furosemide is a diuretic that treats fluid retention and high blood pressure. It helps the body eliminate excess fluid through increased urination.'
};

// GET: AI Medicine Explainer
app.get('/explain/:name', async (req, res) => {
    const medName = req.params.name;
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'MedRemind'
            },
            body: JSON.stringify({
                model: 'openrouter/free',
                messages: [
                    {
                        role: 'user',
                        content: `Explain the medicine "${medName}" in plain, simple English. Keep it under 3 sentences. Focus on what it is primarily used for.`
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (response.ok && data.choices && data.choices[0] && data.choices[0].message) {
            res.status(200).json({ explanation: data.choices[0].message.content });
        } else {
            console.error('OpenRouter API Error:', data);
            // Fallback to local database
            const medNameLower = medName.toLowerCase();
            if (medicineExplanations[medNameLower]) {
                res.status(200).json({ explanation: medicineExplanations[medNameLower] });
            } else {
                const partialMatch = Object.keys(medicineExplanations).find(key => 
                    medNameLower.includes(key) || key.includes(medNameLower)
                );
                if (partialMatch) {
                    res.status(200).json({ explanation: medicineExplanations[partialMatch] });
                } else {
                    res.status(500).json({ error: 'Could not fetch explanation at this time.' });
                }
            }
        }
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        // Fallback to local database
        const medNameLower = medName.toLowerCase();
        if (medicineExplanations[medNameLower]) {
            res.status(200).json({ explanation: medicineExplanations[medNameLower] });
        } else {
            const partialMatch = Object.keys(medicineExplanations).find(key => 
                medNameLower.includes(key) || key.includes(medNameLower)
            );
            if (partialMatch) {
                res.status(200).json({ explanation: medicineExplanations[partialMatch] });
            } else {
                res.status(500).json({ error: 'Could not fetch explanation at this time.' });
            }
        }
    }
});

// GET: Alternative Drug Suggestions (India)
app.get('/alternatives/:name', async (req, res) => {
    const medName = req.params.name;
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'MedRemind'
            },
            body: JSON.stringify({
                model: 'openrouter/free',
                messages: [
                    {
                        role: 'user',
                        content: `Suggest 3-5 alternative medicines available in India that are similar to "${medName}". IMPORTANT: Only suggest actual pharmaceutical medicines (not herbal or Ayurvedic products). Include both generic names and popular brand names available in Indian pharmacies. Format as a clean numbered list with each item on its own line. Example format:
1. Generic Name - Brand Name (Brief description)
2. Generic Name - Brand Name (Brief description)
Focus on cost-effective pharmaceutical alternatives that have the same active ingredients or similar therapeutic class.`
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (response.ok && data.choices && data.choices[0] && data.choices[0].message) {
            res.status(200).json({ alternatives: data.choices[0].message.content });
        } else {
            console.error('OpenRouter API Error:', data);
            res.status(500).json({ error: 'Could not fetch alternatives at this time.' });
        }
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        res.status(500).json({ error: 'Could not fetch alternatives at this time.' });
    }
});

// POST: Symptom-to-Medicine AI
app.post('/symptom-to-medicine', async (req, res) => {
    const { symptoms } = req.body;
    
    if (!symptoms) {
        return res.status(400).json({ error: 'Symptoms description is required' });
    }
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'MedRemind'
            },
            body: JSON.stringify({
                model: 'openrouter/free',
                messages: [
                    {
                        role: 'user',
                        content: `Based on these symptoms: "${symptoms}", suggest 3-5 appropriate over-the-counter medicines available in India. Include both generic names and popular brand names. For each suggestion, provide the medicine name, what it treats, and recommended dosage. IMPORTANT: Add a disclaimer that this is not medical advice and they should consult a doctor. Format as a clean numbered list. Focus on common, safe over-the-counter medicines.`
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (response.ok && data.choices && data.choices[0] && data.choices[0].message) {
            res.status(200).json({ suggestions: data.choices[0].message.content });
        } else {
            console.error('OpenRouter API Error:', data);
            res.status(500).json({ error: 'Could not fetch suggestions at this time.' });
        }
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        res.status(500).json({ error: 'Could not fetch suggestions at this time.' });
    }
});

// POST: Price Comparison AI
app.post('/price-comparison', async (req, res) => {
    const { medicine } = req.body;
    
    if (!medicine) {
        return res.status(400).json({ error: 'Medicine name is required' });
    }
    
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'MedRemind'
            },
            body: JSON.stringify({
                model: 'openrouter/free',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful medical assistant that provides information about medicine pricing in India. Always provide practical, helpful information about pharmacies and pricing.'
                    },
                    {
                        role: 'user',
                        content: `For the medicine "${medicine}", provide practical information about purchasing it in India. Include: 1) Typical price range in INR for common dosages (be realistic), 2) Popular Indian online pharmacies where this medicine is commonly available (1mg, PharmEasy, Netmeds, Amazon Pharmacy, Tata 1mg), 3) General tips for finding better prices (compare across platforms, look for discounts, consider generic versions). IMPORTANT: These are estimates - always verify actual prices on the pharmacy websites. Be helpful and practical. Format as a clean list with clear sections.`
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (response.ok && data.choices && data.choices[0] && data.choices[0].message) {
            res.status(200).json({ comparison: data.choices[0].message.content });
        } else {
            console.error('OpenRouter API Error:', data);
            res.status(500).json({ error: 'Could not fetch price comparison at this time.' });
        }
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        res.status(500).json({ error: 'Could not fetch price comparison at this time.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 MedRemind Backend running on port ${PORT}`));
