const indesCtrl = {};
const SuperUser = require('../models/superUser')
const Event = require('../models/event')
const Producto = require('../models/producto')
const UserAccess = require('../models/userAccess')


//Login
indesCtrl.login = async (req, res) => {
    const errors = [];
    const {usarname, password} = req.body;
    if (usarname != "" && password != "") {
        //Validacion si usuario existe
        const user = await SuperUser.findOne({usarname});
        if (user) {
            //Validacion si la contraseña hace match
            const match = await user.matchPassword(password)
            if (match) {
                res.json({
                    response: true,
                    message: "Credenciales Correctas",
                    data: user
                })
            } else {
                errors.push({message: "La contraseña no coincide"})    
            }
        }else{
            errors.push({message: "El usuario no se encuentra registrado"})
        }

        //Errores
        if (errors.length > 0) {
            res.json({
                response: false,
                message: errors[0].message
            })  
        }
    }else{
        res.json({
            response: false,
            message: "Porfavor envie todos los datos necesarios"
        })
    }
}

//Registrar Super User
indesCtrl.registerSuperUser = async (req, res) => {
    const errors = [];
    const {name, username, email, password} = req.body;
    console.log(req.body)
    if (username != "" && email != "" && password != "" && name != "") {
        //Validaciones
        //Validando password
        if (password.length < 6) {
            errors.push({message: "La contraseña tiene que ser mayor de 6 caracteres"})
        }
        //Valiando el email
        const emailUser = await SuperUser.findOne({email});
        if (emailUser) {
            errors.push({message: "El correo ya esta en uso"})
        } 
        //Condicion si hay error o no
        if (!errors.length > 0) {
            const newSuperUser = new SuperUser({name, username, email, password});
            newSuperUser.password = await newSuperUser.encryptPassword(password);
            const data = await newSuperUser.save();
            res.json({
                response: true,
                message: "Se ha registrado un super usuario",
                data
            })
        }else{
            res.json({
            response: false,
            message: errors[0].message
            })
        }
    } else {
        res.json({
            response: false,
            message: "Porfavor envie todos los datos necesarios"
        })
    }
}

//Actualizar Super User
indesCtrl.updateSuperUserProfile = async (req, res) => {
    const {super_user_id} = req.params;
    console.log(req.body)
    console.log(req.params)
    if (super_user_id != "") {
        if (Object.keys(req.body).length) {
            if (!req.body.password == "") {
                const info = req.body
                const superUser = await SuperUser.findById(super_user_id);                  
                info.password = await superUser.encryptPassword(req.body.password);
                const data = await SuperUser.findByIdAndUpdate(super_user_id, info, {new: true});
                res.json({
                    response: true,
                    message: "Se ha actualizado el perfil",
                    data
                })
            } else {
                const data = await SuperUser.findByIdAndUpdate(super_user_id, res.body);
                res.json({
                    response: true,
                    message: "Se ha actualizado el perfil",
                    data
                })
            }                        
            // const data = await SuperUser.findByIdAndUpdate(super_user_id, )
        } else {
            res.json({
                response: false,
                message: "Porfavor envie algun dato"
            })
        }
    }else{
        res.json({
            response: false,
            message: "Porfavor envie todos los datos necesarios"
        })
    }
}

//Añadir un nuevo usuario de acceso
indesCtrl.addUserControlAccess = async (req, res) => {
    const {name, huella} = req.body;
    if (name != "" && huella != "") {

        const huellaFind = await UserAccess.findOne({huella});
        if (!huellaFind) {
            const newUserAccess = new UserAccess(req.body);
            const data = await newUserAccess.save();
            res.json({
                response: true,
                data
            })
        } else {
            res.json({
                response: false,
                message: "Huella ya ingresada"
            })
        }
    } else {
        res.json({
            response: false, 
            message: "Porfavor envie todos los datos necesarios"
        })
    }
} 

indesCtrl.updateUserControlAccess = async (req, res) => {
    const { user_control_id } = req.params;
    if (user_control_id != "") {
        if (Object.keys(req.body).length) {
            const data = await UserAccess.findByIdAndUpdate(user_control_id, req.body, {new: true})
            res.json({
                response: true,
                data
            })
        } else {
            res.json({
                response: false,
                message: "Porfavor envie algun dato"
            })
        }
    }else{
        res.json({
            response: false,
            message: "Porfavor envie el id"
        })
    }
}

indesCtrl.getUsersControlAccess = async (req, res) => {
    const arrayUserAcces = await UserAccess.find();
    const reverseData = arrayUserAcces.reverse()
    res.json({
        response: true,
        data: reverseData
    });
}

indesCtrl.eliminateUserControlAccess = async (req, res) => {
    const { user_control_id } = req.params;
    if (user_control_id != "") {
        const data = await UserAccess.findByIdAndDelete(user_control_id);
        res.json({
            response: true,            
            message: "Se ha eliminado",
            data
        })
    }else{
        res.json({
            response: false,
            message: "Porfavor envie todos los datos necesarios"
        })
    }
}

indesCtrl.getEvents = async (req, res) => {
    const events = await Event.find();
    const arrayEvents = events.reverse()
    res.json({arrayEvents});
}

indesCtrl.changeStatusEvents = async (req, res) => {
    const { event_id } = req.params;
    const { status } = req.body;    

    if (status != "", event_id != "") {
            const data = await Event.findByIdAndUpdate(event_id, {reviewed: status})
            res.json({
                response: true,
                message: "Status cambiado",
                data
            })      
    }else{
        res.json({
            response: false,
            message: "Porfavor envie todos los datos necesarios"
        })
    }
}

// indesCtrl.eliminateEvents = (req, res) => {
//     const { event_id } = req.params;
//     if (event_id != "") {
//         const data = await Event.findByIdAndDelete(event_id);
//         res.json({
//             response: true,
//             message: "Se ha eliminado",
//             data
//         })
//     }else{
//         res.json({
//             response: false,
//             message: "Porfavor envie todos los datos necesarios"
//         })
//     }
// }

indesCtrl.addInventory = async (req, res) => {
    const {name,price,peso,category} = req.body;    
    if (name  != "" & price  != "" & peso  != "" & category  != "") {
        const newProducto = new Producto(req.body);
        const data = await newProducto.save();        
        res.json({
            response: true,
            message: "Se ha registado un producto",
            data
        })
    } else {
        res.json({
            response: false,
            message: "Porfavor envie todos los datos necesarios"
        })
    }
}

indesCtrl.changeStatusInventory = async (req, res) => {
    const { inventory_id } = req.params;
    const { status } = req.body;    

    if (status != "", inventory_id != "") {
        if (status.toUpperCase() === "ACTIVO" || status.toUpperCase() === "BOBEDA") {
            const data = await Producto.findByIdAndUpdate(inventory_id, {status})
            res.json({
                response: true,
                message: "Status cambiado",
                data
            })
        } else {
            res.json({
                response: false,
                message: "Solo utilizar ACTIVO o BOBEDA"
            })
        }        
    }else{
        res.json({
            response: false,
            message: "Porfavor envie todos los datos necesarios"
        })
    }
}

indesCtrl.getInventory = async (req, res) => {
    const arrayProductos = await Producto.find();
    const reverseData = arrayProductos.reverse()
    res.json({
        response: true,
        data: reverseData
    });
}

indesCtrl.updateInventory = async (req, res) => {
    const { inventory_id } = req.params;
    if (inventory_id != "") {
        if(Object.keys(req.body).length){
            const data = await Producto.findByIdAndUpdate(inventory_id, req.body, {new: true})
            res.json({
                response: true,
                message: "Producto actualizado",
                data
            })
        }else{
            res.json({
                response: false, 
                message: "Porfavor envia algun dato"
            })
        }
    } else {
        res.json({
            response: false,
            message: "Porfavor envie el id del producto"
        })
    }
}

indesCtrl.eliminateInventory = async (req, res) => {
    const { inventory_id } = req.params;
    console.log(inventory_id)
    if (inventory_id != "") {
        const dataE = await Producto.findOneAndDelete({_id: inventory_id})
        console.log(dataE)
        res.json({
            response: true,
            message: "Se he eliminado el producto",
            dataE
        })
    } else {
        res.json({
            response: false,
            message: "Porfavor envie el id del producto"
        })
    }
}


module.exports = indesCtrl;