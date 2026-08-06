import { register, login } from './authController.js';

export const signup = register;
export { register, login };

/**
 * @desc    Get Current Logged-in User Profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

export default { signup, register, login, getProfile };
