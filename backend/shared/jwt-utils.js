const jwt = require("jsonwebtoken");

const secret = process.env.TOKEN_SECRET;
const expiresIn = {expiresIn: "1h"};

const decodeToken = (token) => {
    if(!token) return null
    try {
        const decodedData = jwt.verify(token, secret)
        return decodedData
    } catch (err) {
        return null
    }
};

const encodeToken = (payload) => {
    const encodedToken = jwt.sign(
        payload,
        secret,
        expiresIn
    )
    return encodedToken
};

module.exports = { decodeToken, encodeToken };