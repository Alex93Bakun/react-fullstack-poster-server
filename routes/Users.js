const express = require('express');
const router = express.Router();
const { Users } = require('../models');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10).then((hash) => {
        Users.create({
            username,
            password: hash,
        });
        res.json('SUCCESS');
    });
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await Users.findOne({ where: { username: username } });

    if (!user) {
       return res.json({ error: 'User not found' });
    }

    bcrypt.compare(password, user.password).then((match) => {
        if (!match) {
           return res.json({ error: 'Wrong username and password combination' });
        }

        res.json('You logged in');
    });
});

module.exports = router;
