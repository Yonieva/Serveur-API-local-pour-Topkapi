const express = require('express');
const router = express.Router();
const edfService = require('../services/service_edf');

// ======================================================
// ❤️ STATUS EDF
// GET /api/edf/status
// ======================================================
router.get('/status', (req, res) => {
  res.json({
    success: true,
    service: edfService.getStatus()
  });
});

// ======================================================
// 📦 CACHE DEBUG
// GET /api/edf/cache
// ======================================================
router.get('/cache', (req, res) => {
  res.json({
    success: true,
    data: edfService.getCache()
  });
});

// ======================================================
// 🔄 SCAN MANUEL
// GET /api/edf/scan
// ======================================================
router.get('/scan', (req, res) => {
  edfService.scanIncoming();

  res.json({
    success: true,
    message: 'Scan EDF lancé'
  });
});

// ======================================================
// 📈 HISTORIQUE POUR TOPKAPI
// GET /api/edf/history/:tag
// ======================================================
router.get('/history/:tag', (req, res) => {
  const tag = req.params.tag;

  const data = edfService.getHistoryFromTag(tag);

  if (!data) {
    return res.status(404).json({
      success: false,
      data: [],
      message: `Tag EDF inconnu : ${tag}`
    });
  }

  res.json({
    success: true,
    data
  });
});

module.exports = router;