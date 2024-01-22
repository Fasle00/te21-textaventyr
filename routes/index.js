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
    part: part });
})

router.post('/username', function (req, res) {
  req.session.username = req.body.username;
  console.log(req.session.username);
  res.redirect('/story/0');
})

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
})

module.exports = router;
