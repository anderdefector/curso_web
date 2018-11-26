'use strict'
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');

function pruebas(req, res){
    res.status(200).send({
        message: 'Probando una acción del controlador'
    });
}

function saveUser(req,res){
    var user = new User();

    var params = req.body;
    console.log(params);
    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;
    user.role = 'ROLE_ADMIN';
    user.image = 'null';

    if(params.password){
        bcrypt.hash(params.password,null,null,function(err, hash){
            user.password = hash;
            if(user.name != null && user.surname != null && user.email != null){
                //Guardar el usuario
                user.save((err,userStored)=>{
                    if(err){
                        res.status(500).send({message: 'Error al guardar'});
                    }else{
                        if(!userStored){
                            res.status(404).send({message: 'No se ha registrado el usuario'});
                        }else{
                            res.status(200).send({user: userStored});
                        }   
                    }
                });
            }else{
                res.status(200).send({message: 'Introduce todos los campos'});
            }
        });
    }else{
        res.status(200).send({message: 'Introduce la contraseña'});
    }
}

function loginUser(req, res){
    var params = req.body;
    var email = params.email;
    var password = params.password;

    User.findOne({email: email},(err, user) =>{
        if(err){
            res.status(500).send({message: 'Error en la petición'});
        }else{
            if(!user){
                res.status(400).send({message: 'El usuario no existe'});  
            }else{
                //Comprobar la contraseña
                bcrypt.compare(password, user.password,function(err,check){
                    if(check){
                        if(params.gethash){
                            //devolver un token de jwt
                            res.status(200).send({
                                token: jwt.createToken(user)
                            });
                        }else{
                            res.status(200).send({user}); 
                        }
                    }else{
                        res.status(400).send({message: 'El usuario no ha podido loggearse'});
                    }
                });
            }
        }
    });
}

function updateUser(req, res){
    var userId = req.params.id;
    var update = req.body;

    User.findByIdAndUpdate(userId, update, (err,userUpdated) =>{
        if(err){
            res.status(500).send({message: "Error al actualizar el usuario"});
        }else{
            if(!userUpdated){
                res.status(404).send({message:"El no se ha podido actualizar el usuario"});
            }else{
                res.status(200).send({user: userUpdated});
            }
        }
    });
}

function uploadImage(req, res){
    var userId = req.params.id;
    var file_name = 'No subido';

    if(req.files){
        var file_path = req.files.image.path;
        console.log(file_path);
    }else{
        res.status(200).send({message: 'No ha subido la imagen'});
    }
}

module.exports = {
    pruebas,
    saveUser,
    loginUser,
    updateUser,
    uploadImage
};