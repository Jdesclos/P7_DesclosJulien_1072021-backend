const db = require("../../models");
const fs = require('fs');
const User = db.User;
const Message = db.Message;
const jwt = require('../midleware/auth.midleware');
const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/auth.utils');
const localStorage= require('node-localstorage');
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{4,8}$/;
const { Op } = require("sequelize");

exports.register = (req, res, next) => {
    let email    = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let bio      = req.body.bio;
    let profilePicture = req.body.profilePicture;
    if (email == null || username == null || password == null) {
        return res.status(400).json({ 'error': 'missing parameters' });
    }

    if (username.length >= 13 || username.length <= 4) {
        return res.status(400).json({ 'error': 'wrong username (must be length 5 - 12)' });
    }

    if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ 'error': 'email is not valid' });
    }

    if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
    }
    User.findOne({where:{[Op.or]: [{email:email}, {username:username}]}}).then (user => {
        if(!user){
            bcrypt.hash(password, 10)
            .then(hash => {
                    const user = ({
                        email: email,
                        username:username,
                        password: hash,
                        bio:bio,
                        profilePicture: profilePicture,
                        isAdmin: false
                    });
                    User.create(user)
                    .then(data => {
                        res.send(data);
                    })
                    .catch(err => {
                        res.status(400).send({
                            message:
                            err.message || "Some error occurred while creating the User."
                        });
                    })
                })
        }else {
            res.status(400).send({
               message: "L'email ou l'username existe déjà"
            });        
        }
    })
}    
exports.login = (req,res, next) => {
    let username    = req.body.username;
    let password = req.body.password;
    if (username == null ||  password == null) {
        return res.status(400).json({ 'error': 'missing parameters' });
    }
    User.findOne({
        where: { username: username }
    })
    .then (user => {
        if(!user){
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }else{
            console.log('user found');
        bcrypt.compare(password, user.password)
        
        .then(valid => {
            if (!valid && typeof localStorage === "undefined" || localStorage === null) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
        }else{          
                console.log('password correct')
                return res.status(201).json({
                    userId: user.id,
                    token: jwtUtils.generateTokenForUser(user),
                    username: user.username,
                    isAdmin:user.isAdmin,
                });
            }
            })
        .catch(error => res.status(500).json({ error }));
    }
    })
};
exports.update = (req, res) => {
    const id = req.params.id;
    User.findOne({where: { id: id }})
    .then (user => {//on remplie d'abord les variables avec les données de la base de données
        const userUpdate = ({
            username:User.username,
            password:User.password,
            bio:User.bio,
            profession:User.profession,
            lastname:User.lastname,
            firstname:User.firstname
        });
        if(!user){
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }else{//si les champs envoyés nes sont pas vides on écrase les données précedément enregistrées
            if (req.body.bio != '') {
                userUpdate.bio = req.body.bio;
            }
            if (req.body.username != '') {
                userUpdate.username = req.body.username;
            }
            if ( req.body.password !== undefined && req.body.password != null && req.body.password != "") {
                let password = req.body.password;
                if (!PASSWORD_REGEX.test(password)) {
                    return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
                }
                bcrypt.hash(password, 10)
                userUpdate.password = password;
            }
            if (req.body.profession != '') {
                userUpdate.profession = req.body.profession;
            }
            if (req.body.firstname != '') {
                userUpdate.firstname = req.body.firstname;
            }
            if (req.body.lastname != '') {
                userUpdate.lastname = req.body.lastname;
            }
            if (req.file !== '' && req.file !== null && req.file !== undefined) {
                userUpdate.profilePicture = `${req.protocol}://${req.get('host')}/images/${req.file.filename}`;
            }//on met à jour avec les données conservées (si il y en a) plus les nouvelles données
            User.update(userUpdate, {
                where: { id: id }
              })
                .then(num => {
                  if (num == 1) {
                    res.send({
                        username: userUpdate.username,
                        message: "User was updated successfully."
                    });
                  } else {
                    
                    res.send({
                      message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
                    });
                  }
                })
                .catch(err => {
                  res.status(500).send({
                    message: "Error updating User with id=" + id
                  });
                });
        }
    })    
  };
exports.delete = (req, res) => {
    const id = req.params.id;
    Message.destroy({where: {userId : id}})
        .then( num => {
            if (num == 1) {
                res.send({
                    message: "Messages from user was deleted succesfully"
                })}else {
                    res.send({
                        message: `Cannot delete message with userId=${id}. Maybe Message was not found!`
                    })
                }
        });
    User.destroy({
        where: { id: id }
    })
    .then(num => {
        if (num == 1) {
            res.send({
            message: "User was deleted successfully!"
        });
        } else {
            res.send({
            message: `Cannot delete User with id=${id}. Maybe Message was not found!`
        });
        }
    })
};
exports.getUser = (req,res)=> {
    const id = req.params.id;
    User.findOne({ where: { id: id }})
    .then(data => {
        res.send(data);
    })
}