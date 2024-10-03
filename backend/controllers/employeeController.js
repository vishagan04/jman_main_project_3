// controllers/admin/employeeController.js
const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

// Add a new employee
exports.addEmployee = async (req, res) => {
  const { name, email, role, department, password } = req.body;

  try {
    // Hash the password before saving the employee
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
    const newEmployee = new Employee({ name, email, role, department, password: hashedPassword });

    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all employees
exports.getEmployees = async (req, res) => {
    try {
      const employees = await Employee.find(); // Retrieve all employees from the database
      res.status(200).json(employees);
    } catch (error) {
      res.status(500).json({ message: "Server error: " + error.message });
    }
  };

// Login employee
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the employee by email
    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if the password is correct using bcrypt
    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: employee._id, email: employee.email, role: employee.role },
      process.env.JWT_SECRET, // Replace with your secret key
      { expiresIn: "1h" } // Token expiration time
    );

    // Send back employee details and token
    res.status(200).json({
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      token, // Include the token in the response
    });
  } catch (error) {
    res.status(500).json({ message: "Server error: " + error.message });
  }
};