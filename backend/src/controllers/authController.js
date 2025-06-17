const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1hr",
  });
};

exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Please enter all fields",
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      message: "Please enter password with atleast 8 characters",
    });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "User with that email already exists",
      });
    }
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({
        message: "Username already taken. Please try different one",
      });
    }

    user = new User({ username, email, password });
    await user.save();
    return res.status(201).json({
      message: "Signup successful! You can login now.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error: ", error);
    res.status(500).json({
      message: "Internal server error while signup",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Please enter all fields",
    });
  }

  try {
    const user =await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials ",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }
    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.log("Server Login error: ", error);
    res.status(500).json({
      message: "Internal Server error during login",
    });
  }
};
