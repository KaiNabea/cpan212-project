const { decodeToken } = require("../jwt-utils");

/**
 * @param {string[]} requiredRoles
 */
 
function authorize(requiredRoles = []) {
  return function(req, res, next) {
    const lang = req.cookies.lang || "EN";
    const authHeader = req.get("Authorization"); 
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        errorMessage:
          lang === "FR"
            ? "Vous n'êtes pas autorisé à accéder à cette ressource."
            : "You don't have permission to access this resource",
      });
    }
    const encodedToken = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = decodeToken(encodedToken); 
    } catch (error) {
      return res.status(401).json({
          errorMessage:
            lang === "FR"
              ? "Jeton invalide ou expiré."
              : "Invalid or expired token.",
      });
    }
    if (!decoded) {
      return res.status(401).json({
        errorMessage:
          lang === "FR"
            ? "Jeton invalide."
            : "Invalid token.",
      });
    }
    req.user = decoded.user || decoded;
    const userRoles = req.user.roles || []; 
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    if (requiredRoles.length > 0 && !hasRequiredRole) {
      return res.status(403).json({
          errorMessage:
              lang === "FR"
                ? "Accès refusé. Rôle insuffisant."
                : "Access denied. Insufficient role.",
      });
    }
    next();
  }
}

module.exports = authorize;