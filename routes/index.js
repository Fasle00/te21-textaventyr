const express = require('express');
const router = express.Router();

const story = require('../data/story.json');

router.get('/', function (req, res) {
  console.log(story.parts[0]);
  res.render('index.njk', { title: 'Welcome', part: story.parts[0] });
})

router.get('/story', function (req, res) {
  const part = story.parts.find((part) => part.id === 1);
  res.render('story.njk', {
    username: req.session.username,
    title: part.name,
    part: part
  });
});

router.post('/username', function (req, res) {
  req.session.username = req.body.username;
  console.log(req.session.username);
  res.redirect('/story/0');
});

router.get('/story/:id', function (req, res) {
  let part = story.parts.find((part) => part.id === parseInt(req.params.id))
  if (!part) {
    res.status(404).render('404.njk', { title: '404' });
    return;
  }
  const text = part.text.replace('[USERNAME]', req.session.username);
  for (let option of part.options) {
    option.text = option.text.replace('[USERNAME]', req.session.username);
  }
  part = { ...part, text: text };
  res.render('part.njk', { title: part.name, part: part });
});

const pool = require('../db');

router.get('/dbtest', async (req, res) => {
  try {
    const id = req.params.id;
    const [parts] = await pool.promise().query(`SELECT * FROM fabian_part`);
    const [options] = await pool.promise().query(`SELECT * FROM fabian_option`);
    res.json({ parts, options });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.get('/dbtest/story', async (req, res) => {
  res.render('index-db.njk', { title: 'Welcome', part: story.parts[0] });
});

router.post('/username-db', function (req, res) {
  req.session.username = req.body.username;
  console.log(req.session.username);
  res.redirect('/dbtest/1');
})

router.get('/dbtest/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [parts] = await pool.promise().query(`SELECT * FROM fabian_part WHERE id = ${id}`);
    const [options] = await pool.promise().query(`SELECT * FROM fabian_option WHERE part_id = ${id}`);
    //res.json({ parts, options });
    const part = { ...parts[0], options }
    res.render('part-db.njk', {
      username: req.session.username,
      title: part.name,
      part: part
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;
