const express = require('express');
const router = express.Router();
const {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustStock,
} = require('../controllers/inventoryController');

router.get('/', getInventory);
router.post('/', createInventoryItem);
router.put('/:id', updateInventoryItem);
router.delete('/:id', deleteInventoryItem);
router.patch('/:id/stock', adjustStock);

module.exports = router;