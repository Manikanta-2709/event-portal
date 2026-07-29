const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: { type: String, required: true },
    role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
    avatar: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' },
    },
    isBlocked: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true }, // organizers require approval
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// organizers default to pending approval
userSchema.pre('save', function (next) {
  if (this.isNew && this.role === 'organizer') this.isApproved = false;
  next();
});

module.exports = mongoose.model('User', userSchema);
