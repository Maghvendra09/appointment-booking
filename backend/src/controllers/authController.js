const jwt = require('jsonwebtoken');
const User = require('../models/User');


const register = async (req, res) => {
  try {
    const { name, email, password, role = 'patient' } = req.body;
    

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        error: { 
          code: 'USER_EXISTS', 
          message: 'User already exists with this email' 
        } 
      });
    }

    user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    user = user.toObject();
    delete user.password;

    res.status(201).json({ 
      user, 
      token 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: { 
        code: 'REGISTRATION_ERROR', 
        message: 'Error registering user' 
      } 
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        error: { 
          code: 'INVALID_CREDENTIALS', 
          message: 'Invalid email or password' 
        } 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        error: { 
          code: 'INVALID_CREDENTIALS', 
          message: 'Invalid email or password' 
        } 
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ 
      user: userResponse, 
      token 
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: { 
        code: 'LOGIN_ERROR', 
        message: 'Error logging in' 
      } 
    });
  }
};

  const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ 
      error: { 
        code: 'SERVER_ERROR', 
        message: 'Server error' 
      } 
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};
