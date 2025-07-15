const Joi = require("joi");

exports.leaveApplySchema = Joi.object({
  username: Joi.string().required(),
  apply_date: Joi.date().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  reason_for_leave: Joi.string().required(),
  paid_leave_days: Joi.number().min(0).optional(),
  unpaid_leave_days: Joi.number().min(0).optional(),
  status: Joi.string().valid("submitted", "accepted", "rejected").default("submitted"),
  hr_note: Joi.string().allow("").optional(),
});
