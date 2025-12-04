const bcrypt = require("bcrypt");

const encodePassword = async (raw) => {
    try {
        const saltRounds = bcrypt.genSaltSync(10)
        const hashedPassword = await bcrypt.hash(raw, saltRounds)
        return hashedPassword
    } catch (err) {
        console.error("Error! Something went wrong in the hashing process!", err)
    }
};

const matchPassword = (raw, encoded) => {
    try {
        const isMatch = bcrypt.compareSync(raw, encoded)
        if (!isMatch) {
            console.error("Error! Passwords don't match.")
            return false
        } else {
            return true
        }
    } catch (err) {
        console.error("Error! Something went wrong in the matching process!", err)
    }
};

module.exports = { encodePassword, matchPassword };