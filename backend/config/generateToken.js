const jwt = require("jsonwebtoken");
// jwt helps us to authorised user to the backend 
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "900d",
    });
};
module.exports = generateToken;