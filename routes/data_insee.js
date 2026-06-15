const express = require('express');
const router = express.Router();

const inseeService = require('../services/service_insee');

router.get('/status', (req, res) => {
  res.json({
    success: true,
    service: inseeService.getStatus()
  });
});

router.get('/cache', (req, res) => {
  res.json({
    success: true,
    data: inseeService.getCache()
  });
});

router.get('/scan', async (req, res) => {
  await inseeService.fetchData();

  res.json({
    success: true,
    message: 'MAJ INSEE lancée'
  });
});

router.get('/value/:tag', (req, res) => {
  const tag = req.params.tag;
  const result = inseeService.getValueFromTag(tag);

	if (result === null || result === undefined) {
    return res.status(404).json({
      success: false,
      value: null,
      message: `Tag INSEE inconnu : ${tag}`
    });
  }

  res.json({
    success: true,
    value:result.value,
	date:result.date
  });
});

module.exports = router;