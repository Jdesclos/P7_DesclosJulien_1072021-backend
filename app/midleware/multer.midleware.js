const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images/attachment');//indique à multer d'enregistrer dans le dossier images
  },
  filename: (req, file, callback) => {
    let name = file.originalname.split(' ').join('_');//remplace les espaces par des '_'
    if(name.includes('png')){
      name = name.replace('.png','');
    }else if(name.includes('jpeg')){
      name=name.replace('.jpeg','')
    }else if(name.includes('gif')){
      name=name.replace('.gif','')
    }   
    const extension = MIME_TYPES[file.mimetype];//met la bonne extension de fichier
    callback(null, name + Date.now() + '.' + extension);//nomduficherdate.extension
  }
});
module.exports = multer({storage: storage}).single('image');//nous exportons ensuite l'élément multer entièrement configuré,
                                                            //lui passons notre constante storage et lui indiquons que nous gérerons uniquement les téléchargements de fichiers image.