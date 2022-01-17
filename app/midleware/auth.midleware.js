const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];//on récupère le token du header et on enlève les espaces
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);//verify compare le token du header et celui qu'on a
    const userId = decodedToken.userId;//on récupère l'id de l'utilisateur du token
    if (req.body.userId && req.body.userId !== userId) {//si la demande contient un ID utilisateur, nous le comparons à celui extrait du token. S'ils sont différents, nous générons une erreur ;
      throw 'Invalid user ID';
    } else {
      req.userId = userId;
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};
