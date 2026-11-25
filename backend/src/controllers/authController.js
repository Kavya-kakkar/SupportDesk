const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { successResponse, errorResponse } = require('../utils/apiResponse');

const register = async (req, res, next) => {
  try {
    const { name, email, password, organization } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'An account with this email address already exists.');
    }

    const user = new User({
      name,
      email,
      password,
      organization: organization || 'Acme Support Ops',
      role: 'user', // Always default to user role on self-registration
    });

    await user.save();

    const token = generateToken(user);

    return successResponse(
      res,
      201,
      'Account created successfully.',
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
        },
      }
    );
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    const token = generateToken(user);

    return successResponse(
      res,
      200,
      'Signed in successfully.',
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organization: user.organization,
        },
      }
    );
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  return successResponse(res, 200, 'Current user profile.', {
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organization: req.user.organization,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = {
  register,
  login,
  getMe,
};
