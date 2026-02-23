const express = require('express');
const router = express.Router();
const {
  getCompany,
  saveCompany
} = require('../controllers/companyController');

router.get('/', getCompany);
router.post('/', saveCompany);

module.exports = router;