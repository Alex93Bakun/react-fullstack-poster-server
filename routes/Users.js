const express = require('express');
const router = express.Router();
const { Users } = require('../models');
const bcrypt = require('bcrypt');

const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middlewares/authMiddleware');

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
            return res.json({
                error: 'Wrong username and password combination',
            });
        }

        const accessToken = sign(
            { username: user.username, id: user.id },
            'importantsecret'
        );
        res.json({ token: accessToken, username, id: user.id });
    });
});

router.get('/auth', validateToken, async (req, res) => {
    res.json(req.user);
});

router.get('/basic-info/:id', async (req, res) => {
    const id = req.params.id;

    const basicInfo = await Users.findByPk(id, {
        attributes: { exclude: ['password'] },
    });

    res.json(basicInfo);
});

module.exports = router;
