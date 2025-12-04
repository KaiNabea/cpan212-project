const { decodeToken } = require("../jwt-utils");

function authorize(req, res, next) {
  const lang = req.cookies.lang || "EN";
  const encoded = req.get("Authorization");
  const decoded = decodeToken(encoded);
  if (!decoded) {
    return res.status(401).json({
      errorMessage:
        lang === "FR"
          ? "Vous n'êtes pas autorisé à accéder à cette ressource."
          : "You don't have permission to access this resource",
    });
  }
  req.user = decoded;
  next();
}

module.exports = authorize;