const mongoose = require("mongoose");

/* for hight precesion with numbers using Decimal128, don't  
For getter to work declare toJSON: { getters: true } in schema model.
*/
const DecimalField = {
  required: true,
  type: mongoose.Schema.Types.Decimal128,
  get: (v) => v.toString(),
};

const DecimalOptionalField = {
  type: mongoose.Schema.Types.Decimal128,
  get: (v) => v.toString(),
};

module.exports = {
  DecimalField,
  DecimalOptionalField,
};
