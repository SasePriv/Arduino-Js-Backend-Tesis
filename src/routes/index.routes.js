const router = require('express').Router();
const controllers = require('../controllers/index.controller')
const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;


router.get('/', (req, res) => {
    res.send('BackEnd CRUD Express');
})

//Iniciar Sesion
router.post('/login', controllers.login)
//Registrar a un super usuario
router.post('/registerSuperUser', controllers.registerSuperUser)
//Actualiza la informacion del perfil del super usuario
router.post('/updateSuperUserProfile/:super_user_id', controllers.updateSuperUserProfile)
//Añadir un usuario para el control de acceso
router.post('/addUserControlAccess', controllers.addUserControlAccess)
//Actualizar un usuario para el control de acceso
router.post('/updateUserControlAccess/:user_control_id', controllers.updateUserControlAccess)
//Devuelve a todos los usuarios control de acceso
router.get('/getUsersControlAccess', controllers.getUsersControlAccess)
//Eliminar un usuario para el control de acceso
router.post('/eliminateUserControlAccess/:user_control_id', controllers.eliminateUserControlAccess)
//Devuelve todos los eventos disponibles
router.get('/getEvents', controllers.getEvents)
//Cambia el estado del evento
router.post('/changeStatusEvents/:event_id', controllers.changeStatusEvents)

//Devuelve un solo evento
// router.post('/getSingleEvents/:event_id', controllers.getEvents)
//Elimina un evento mediante su id 
// router.post('/eliminateEvents/:event_id', controllers.eliminateEvents)

//Añade un nuevo objeto al inventario
router.post('/addInventory', controllers.addInventory)
//Cambia el status del evento
router.post('/changeStatusInventory/:inventory_id',controllers.changeStatusInventory)
//Devuelve todos los objetos en el inventario
router.get('/getInventory', controllers.getInventory)
//Actualiza un valor del inventario mediante su id
router.post('/updateInventory/:inventory_id', controllers.updateInventory)
//Elimina un valor del inventario mediante su id
router.post('/eliminateInventory/:inventory_id', controllers.eliminateInventory)


//Socket.io
// router.get('/arduino', (req, res) => {  
        
//     const mySerial = new SerialPort("\\\\.\\COM3", {
//         baudRate: 500000,
//         autoOpen: true
//     },(error) => {
//         // If serial port for the Arduino is not available catch the error
//         if (error) {                
//             console.log("You pulled the plug! " + error);          
//             res.json({
//                 response: false,            
//             })
//         }    
//     });
    
    

//     const parser = mySerial.pipe(new Readline({delimeter: '\r\n'}));        

//     mySerial.on('open', function(){
//         console.log('Opened serial Port');
//         res.json({
//             response: true,            
//         })
//     })

//     mySerial.on('close', function(err){
//         console.log('Error');
//     })
        
//     parser.on('data', (data) => {
//         // console.log("Datos: "+ data.toString());
//         const info = data.toString().split(",");
//         info.forEach(element => {
//             const dataInfo = element.split(":");
//             switch(dataInfo[0]){
//                 case "i":
//                     if (dataInfo[1]) {
//                         console.log("Infrarrojo Status: "+dataInfo[1])    
//                     }
//                     break;
//                 case "p":
//                     if (dataInfo[1]) {
//                         console.log("Puerta: "+dataInfo[1])    
//                     }
//                     break;
//                 case "k":
//                     if (dataInfo[1]) {
//                         console.log("Teclado: "+dataInfo[1])    
//                     }
//                     break;
//                 case "g":
//                     if (dataInfo[1]) {
//                         console.log("Gramos: "+dataInfo[1])    
//                     }
//                     break;
//             }
//         });
//         console.log(data.toString())
//         console.log("---------------")
    
//     })

// })

module.exports = router;