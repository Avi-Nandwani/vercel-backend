const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  exportUsersCSV
} = require('../controllers/userController');

// Get all users with pagination and search + Create a new user
router.route('/')
  .get(getUsers)
  .post(createUser);

// Export users to CSV
router.get('/export', exportUsersCSV);

// Get user by ID + Update user + Delete user
router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;