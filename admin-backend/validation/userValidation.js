const Joi = require("joi");

const registerUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "any.required": "Username is required",
  }),                                                         // like birth_year
  email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } }).required().messages({
    "string.email": "Email must be valid",
    "any.required": "Email is required",
  }),
  password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(6).required().messages({
    "string.min": "Password must be at least 6 characters",
    "any.required": "Password is required",
  }),
  role: Joi.string().valid("admin", "hr", "employee").required(),
  user_state: Joi.string().valid("active", "inactive").default("active"),

  personalInfo: Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().allow("", null),
    mobile: Joi.string()
      .pattern(/^\d{10}$/)
      .required()
      .messages({
        "string.pattern.base": "Mobile number must be 10 digits",
      }),
    dob: Joi.string().required(),
  }).required(),

  employmentInfo: Joi.object({
    designation: Joi.string().required(),
    department: Joi.string().required(),
    dutyType: Joi.string().required(),
    emloyeementType: Joi.string().required(),
    dateOfJoining: Joi.string().required(),
    dateOfLeaving: Joi.string().allow("", null),
    salary: Joi.number().optional(),
  }),

  bankDetails: Joi.object({
    bankName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    bankBranch: Joi.string().required(),
    IFSC: Joi.string().required(),
  }),

  additionalInfoDetail: Joi.object({
    address: Joi.string().allow("", null),
    graduationYear: Joi.string().allow("", null),
    previousEmpName: Joi.string().allow("", null),
    dateOfLeaving: Joi.string().allow("", null),
  }),
});

module.exports = { registerUserSchema };
