// username
// useremail
// userpassword
// userimage

const { timeStamp } = require('console');
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true,unique:true },
    password: { type: String, required: true },
    pic: { type: String,
default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg" },
},
    {
        timeStamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) { // comparing the entered password with entered password
    return await bcrypt.compare(enteredPassword, this.password);
}
    
userSchema.pre("save", async function (next) { // encrypt the password before saving into DB
    if (!this.isModified) {
        next() // if already encrypted then skip.
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

const User = mongoose.model("User", userSchema);
module.exports = User;
