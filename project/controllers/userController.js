const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');
const fastCsv = require('fast-csv');

/**
 * @desc    Get all users with pagination and search
 * @route   GET /api/users
 * @access  Public
 */
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  
  const skip = (page - 1) * limit;
  
  let query = {};
  
  if (search) {
    // Using $or for searching across multiple fields
    query = {
      $or: [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        {phone: { $regex: search, $options: 'i' }},
        {city: { $regex: search, $options: 'i' }},
        {country: { $regex: search, $options: 'i' }}
      ]
    };
  }
  
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  
  res.json({
    data: users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Create a new user
 * @route   POST /api/users
 * @access  Public
 */
const createUser = asyncHandler(async (req, res) => {
  const { 
    first_name, 
    last_name, 
    email, 
    phone, 
    address, 
    city, 
    state, 
    zip_code, 
    country 
  } = req.body;
  
  const userExists = await User.findOne({ email });
  
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }
  
  const user = await User.create({
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    state,
    zip_code,
    country
  });
  
  if (user) {
    res.status(201).json(user);
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Update a user
 * @route   PUT /api/users/:id
 * @access  Public
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    // Check email uniqueness if email is being updated
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        res.status(400);
        throw new Error('User with this email already exists');
      }
    }
    
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.city = req.body.city || user.city;
    user.state = req.body.state || user.state;
    user.zip_code = req.body.zip_code || user.zip_code;
    user.country = req.body.country || user.country;
    
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/users/:id
 * @access  Public
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (user) {
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Export users to CSV
 * @route   GET /api/users/export
 * @access  Public
 */
const exportUsersCSV = asyncHandler(async (req, res) => {
  const search = req.query.search || '';
  
  let query = {};
  
  if (search) {
    query = {
      $or: [
        { first_name: { $regex: search, $options: 'i' } },
        { last_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };
  }
  
  const users = await User.find(query).sort({ createdAt: -1 });
  
  if (!users || users.length === 0) {
    res.status(404);
    throw new Error('No users found to export');
  }
  
  // Create a temporary file path
  const tempFilePath = path.join(__dirname, '..', 'temp', `users-${Date.now()}.csv`);
  
  // Ensure temp directory exists
  if (!fs.existsSync(path.join(__dirname, '..', 'temp'))) {
    fs.mkdirSync(path.join(__dirname, '..', 'temp'));
  }
  
  // Define CSV headers
  const csvStream = fastCsv.format({ headers: true });
  const writeStream = fs.createWriteStream(tempFilePath);
  
  // When stream finishes, send file to client
  writeStream.on('finish', () => {
    res.download(tempFilePath, 'users.csv', (err) => {
      // Delete temp file after download
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      if (err) {
        console.error('Error downloading CSV:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error downloading file' });
        }
      }
    });
  });
  
  // Write to CSV
  csvStream.pipe(writeStream);
  
  users.forEach(user => {
    csvStream.write({
      'First Name': user.first_name || '',
      'Last Name': user.last_name || '',
      'Email': user.email || '',
      'Phone': user.phone || '',
      'Address': user.address || '',
      'City': user.city || '',
      'State': user.state || '',
      'Zip Code': user.zip_code || '',
      'Country': user.country || ''
    });
  });
  
  csvStream.end();
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  exportUsersCSV
};