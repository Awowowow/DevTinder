const validator = require("validator");
const { body, param } = require('express-validator');

const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  
  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  }
  if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

const validateProfileEditData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "description",
    "skills",
  ];
  
  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  
  return isEditAllowed;
};

const validateEditFieldValue = (req) => {
  const { firstName, lastName, photoUrl, gender, age, skills, description } = req.body;

  if (firstName !== undefined) {
    if (typeof firstName !== "string" || firstName.trim().length < 4 || firstName.length > 50) {
      throw new Error("First name must be between 4 and 50 characters");
    }
  }

  if (lastName !== undefined) {
    if (typeof lastName !== "string" || lastName.trim().length < 4 || lastName.length > 50) {
      throw new Error("Last name must be between 4 and 50 characters");
    }
  }

  if (photoUrl !== undefined) {
    if (photoUrl.trim() !== "" && !validator.isURL(photoUrl)) {
      throw new Error("Photo URL must be a valid URL");
    }
  }

  if (gender !== undefined) {
    if (typeof gender !== "string") {
      throw new Error("Gender must be a string");
    }
    const allowedGenders = ["male", "female", "others"];
    const normalizedGender = gender.trim().toLowerCase();
    
    if (!allowedGenders.includes(normalizedGender)) {
      throw new Error("Gender must be: male, female, or others");
    }
    req.body.gender = normalizedGender;
  }


  if (age !== undefined) {
    const ageNum = Number(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 150) {
      throw new Error("Age must be between 18 and 150");
    }
  }


  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      throw new Error("Skills must be an array");
    }
    if (skills.length > 10) {
      throw new Error("You can add maximum 10 skills");
    }
    skills.forEach((skill, index) => {
      if (typeof skill !== "string" || skill.trim().length === 0) {
        throw new Error(`Skill at position ${index + 1} must be non-empty`);
      }
      if (skill.length > 50) {
        throw new Error(`Skill at position ${index + 1} must be less than 50 characters`);
      }
    });
  }


  if (description !== undefined) {
    if (typeof description !== "string") {
      throw new Error("description must be a string");
    }
    if (description.length > 500) {
      throw new Error("description section must be less than 500 characters");
    }
  }

  return true;
};

const sendRequestValidation = [
  param('status')
    .isIn(['ignored', 'interested'])
    .withMessage('Status must be either ignored or interested'),
  param('toUserId')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];

const reviewRequestValidation = [
  param('status')
    .isIn(['accepted', 'rejected'])
    .withMessage('Status must be either accepted or rejected'),
  param('requestId')
    .isMongoId()
    .withMessage('Invalid request ID format'),
];




module.exports = {
  validateSignUpData,
  sendRequestValidation,
  reviewRequestValidation,
  validateProfileEditData,
  validateEditFieldValue
};