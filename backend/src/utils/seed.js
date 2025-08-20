const User = require('../models/User');

const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      // Create admin user
      const admin = new User({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'Passw0rd!',
        role: 'admin'
      });
      
      await admin.save();
      console.log('Admin user created successfully');
    }
    
    // Check and create test patient user
    const patientExists = await User.findOne({ email: 'patient@example.com' });
    
    if (!patientExists) {
      // Create test patient user
      const patient = new User({
        name: 'Test Patient',
        email: 'patient@example.com',
        password: 'Passw0rd!',
        role: 'patient'
      });
      
      await patient.save();
      console.log('Test patient user created successfully');
    }
    
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = { seedAdminUser };
