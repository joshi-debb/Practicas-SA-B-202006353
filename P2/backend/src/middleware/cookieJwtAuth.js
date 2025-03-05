const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;
const GRACE_PERIOD = process.env.JWT_GRACE_PERIOD || "1m";
const TOKEN_EXPIRATION = process.env.JWT_EXPIRATION || "1h";

const cookieJwtAuth = (req, res, next) => {
    const token = req.cookies.access_token;

    if (!token) {
        return res.status(403).json({ message: "No autorizado" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                const now = Math.floor(Date.now() / 1000);
                const expiredAt = err.expiredAt.getTime() / 1000;

                const gracePeriodInSeconds = parseDuration(GRACE_PERIOD);
                
                // Verificar si está dentro del período de gracia
                if (now - expiredAt <= gracePeriodInSeconds) {
                    const newToken = jwt.sign(
                        { id: user.id, username: user.user },
                        SECRET_KEY,
                        { expiresIn: TOKEN_EXPIRATION }
                    );

                    res.cookie("access_token", newToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "strict",
                    });

                    req.user = user;
                    return next();
                }
            }

            return res.status(403).json({ message: "Token inválido" });
        }

        req.user = user;
        next();
    });
};

function parseDuration(duration) {
    const unit = duration.slice(-1);
    const value = parseInt(duration.slice(0, -1));

    switch (unit) {
        case "s": return value;
        case "m": return value * 60;
        case "h": return value * 60 * 60;
        case "d": return value * 60 * 60 * 24;
        default: return 0;
    }
}

module.exports = cookieJwtAuth;
