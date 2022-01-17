const db = require("../../models");
const fs = require('fs');
const User = db.User;
const jwt = require('../midleware/auth.midleware');
const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/auth.utils');
const localStorage= require('node-localstorage');
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{4,8}$/;

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
    bcrypt.hash(password, 10)
    .then(hash => {
        console.log(User.length)
        if(User.length < 1){
            const user = ({
                email: email,
                username:username,
                password: hash,
                bio:bio,
                profilePicture: profilePicture,
                isAdmin: true
            });
            User.create(user)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.status(500).send({
                    message:
                    err.message || "Some error occurred while creating the User."
                });
            })
        }else {
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
                res.status(500).send({
                    message:
                    err.message || "Some error occurred while creating the User."
                });
            })            
        }
    });
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
    User.update(req.body, {
      where: { id: id }
    })
      .then(num => {
        if (num == 1) {
          res.send({
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
  };

exports.delete = (req, res) => {
    const id = req.params.id;

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
    .catch(err => {
        res.status(500).send({
            message: "Could not delete User with id=" + id
        });
    });
};

exports.getUser = (req,res)=> {
    console.log(req.params)
    const id = req.params.id;
    console.log(id)
    User.findOne({ where: { id: id }})
    .then(data => {
        res.send(data);
    })
}