const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Employee = require('./models/Employee');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/famspay';

async function assignDefaultPasswords() {
  try {
    await mongoose.connect(MONGO_URI);
    const employeesWithoutPassword = await Employee.find({
      $or: [{ password: { $exists: false } }, { password: '' }, { password: null }]
    });

    if (employeesWithoutPassword.length === 0) {
      console.log('All existing accounts already have passwords.');
      process.exit(0);
    }

    const hashedDefault = await bcrypt.hash('famspay123', 10);

    for (const emp of employeesWithoutPassword) {
      emp.password = hashedDefault;
      if (!emp.role) emp.role = 'employee';
      await emp.save();
      console.log(`Assigned default password to: ${emp.email}`);
    }

    console.log('Done. Existing users can log in with password: famspay123');
    process.exit(0);
  } catch (err) {
    console.error('Error updating passwords:', err);
    process.exit(1);
  }
}

assignDefaultPasswords();