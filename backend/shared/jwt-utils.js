const jwt = require("jsonwebtoken");

const secret = process.env.TOKEN_SECRET;
const expiresIn = {expiresIn: "1h"};

const decodeToken = (token) => {
    if(!token) return
    const splitedToken = token.split(" ")[1]
    const decodedData = jwt.verify(splitedToken, secret)
    return decodedData
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