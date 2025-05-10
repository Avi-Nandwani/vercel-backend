/**
 * Utility functions for handling CSV exports
 */

const fs = require('fs');
const path = require('path');
const fastCsv = require('fast-csv');

/**
 * Formats users data for CSV export
 * @param {Array} users - Array of user objects
 * @returns {Array} - Formatted users data
 */
const formatUsersForCSV = (users) => {
  return users.map(user => ({
    'First Name': user.first_name || '',
    'Last Name': user.last_name || '',
    'Email': user.email || '',
    'Phone': user.phone || '',
    'Address': user.address || '',
    'City': user.city || '',
    'State': user.state || '',
    'Zip Code': user.zip_code || '',
    'Country': user.country || ''
  }));
};

/**
 * Creates a CSV file from user data
 * @param {Array} users - Array of user objects
 * @param {String} filePath - Path to save the CSV file
 * @returns {Promise} - Resolves when the file is created
 */
const createCSVFile = (users, filePath) => {
  return new Promise((resolve, reject) => {
    const formattedUsers = formatUsersForCSV(users);
    const csvStream = fastCsv.format({ headers: true });
    const writeStream = fs.createWriteStream(filePath);
    
    writeStream.on('finish', () => resolve(filePath));
    writeStream.on('error', reject);
    
    csvStream.pipe(writeStream);
    formattedUsers.forEach(user => csvStream.write(user));
    csvStream.end();
  });
};

module.exports = {
  formatUsersForCSV,
  createCSVFile
};