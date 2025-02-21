require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(express.json());

// Connexion à Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Route d'inscription
app.post('/signup', async (req, res) => {
    const { email, password, username } = req.body;

    // Vérifier si l'username est déjà pris
    const { data: existingUser, error: usernameError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

    if (existingUser) {
        return res.status(400).json({ error: 'Username déjà utilisé' });
    }

    // Création de l'utilisateur dans Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    // Ajout du username dans la table users
    await supabase.from('users').insert([{ id: data.user.id, username, email }]);

    res.status(201).json({ message: 'Utilisateur créé', user: data.user });
});

// Route de connexion
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: 'Connexion réussie', user: data.user });
});

// Route test d'authentification
app.get('/welcome', (req, res) => {
    res.send("Hello, bienvenue sur LegiChain !");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
