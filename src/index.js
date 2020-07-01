const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const SerialPort = require('serialport');
const router = require('express').Router();
const bodyParser = require('body-parser');
const morgan = require('morgan')
var multer = require('multer');
const http = require('http')
const socketIO = require('socket.io')
// require('events').EventEmitter.prototype._maxListeners = 0;
// require('events').EventEmitter.defaultMaxListeners = 0



//Initiliazations
const Readline = SerialPort.parsers.Readline;


const app = express();
const server = http.createServer(app);
const io = socketIO.listen(server);
var upload = multer();
require('./database');
require('dotenv').config()


//Settings
app.set('port', 3010);
app.set('views', path.join(__dirname, 'views'));

app.all('/*', function(req, res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Key, Authorization");
    res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, PATCH");
    next()
 }); 


//Middlewares
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(upload.array()); 
// app.use(methodOverride(' '));
// app.use(session({
//     secret: 'mysecretaapp',
//     resave: true,
//     saveUninitialized: true
// }));
//Global Varibales

//Routes
app.use(require('./routes/index.routes'));

//Informacion del arduino

const arduinoInfo = {
    status: "inactive",    
    infoArduino: "",
    actualIteam : "",
    item: null,
    itemStatus: false,
    doorAuthorizedOpen: false,
    eventStatus: false,
}

//--------------------------------------------------------------------------------
//------------------------------------------------------

const UserAccess = require('./models/userAccess');
const Event = require('./models/event');
const { isRegExp } = require('util');

//VActivar Vitrin
app.get('/arduino', async (req, res) => {

    let iniStatus = true;
    //Serial comunication
    const mySerial = new SerialPort("\\\\.\\COM3", {
        baudRate: 500000,
        autoOpen: true
    },(error) => {
        // If serial port for the Arduino is not available catch the error
        if (error) {                
            console.log("You pulled the plug! " + error);          
            console.log(error.message)
            arduinoInfo.status = "inactive";
            arduinoInfo.infoArduino = "";
            io.emit("ifArduino", arduinoInfo)
            res.json({
                response: false,            
            })
        }    
    });
    const parser = mySerial.pipe(new Readline({delimeter: '\r\n'}));        

    //Al momento de abrir la conexion con el arduino
    mySerial.on('open', function(){
        console.log('Opened serial Port');
        arduinoInfo.status = "active";
        io.emit("ifArduino", arduinoInfo)
        res.json({
            response: true,            
        })
    })

    //momento cuando el arduino se cierra
    mySerial.on('close', function(err){
        console.log('Error Desconecion');
        arduinoInfo.status = "inactive";
        arduinoInfo.infoArduino = "";
        arduinoInfo.itemStatus = false;
        arduinoInfo.item = null;
        arduinoInfo.actualIteam = ""
        io.emit("ifArduino", arduinoInfo)
    })

    //Socket.io
    io.on('connection', function(socket) {
        //Para poner el default 0 del peso
        socket.on('passPeso', data =>{
            console.log("Peso")
            mySerial.write(data.message)
        });
        //Para la activacion del iteam
        socket.on('itemActivation', data => {
            console.log("Activacion Item")
            arduinoInfo.itemStatus = data.status
            arduinoInfo.item = data.itemObject
            arduinoInfo.actualIteam = data.itemId
            mySerial.write('a')
            io.emit("ifArduino", arduinoInfo)
        })
        //Para la desactivacion del iteam
        socket.on('itemDesactive', data => {
            console.log("Activacion Item")
            arduinoInfo.itemStatus = data.status
            arduinoInfo.item = data.itemObject
            arduinoInfo.actualIteam = data.itemId
            mySerial.write('b')
            io.emit("ifArduino", arduinoInfo)
        })
        //Desactivacion 
        socket.on('itemDesactiveEvent', data => {
            console.log("Activacion Item")
            arduinoInfo.itemStatus = data.status
            arduinoInfo.item = data.itemObject
            arduinoInfo.actualIteam = data.itemId
            arduinoInfo.eventStatus = data.eventStatus
            mySerial.write('b')
            io.emit("ifArduino", arduinoInfo)
            io.emit("turnOffEvent", data.eventStatus)
        })
        socket.on('DoorOpen', data =>{
            console.log("OpenDoorrrrr")
            mySerial.write('b')
        })
        socket.on('closeDoor', data =>{
            mySerial.write('a')
        })
    })

    let cont = 0;
        
    parser.on('data', (data) => {
        // console.log("Datos: "+ data.toString());
        const info = data.toString().split(",");
        // io.emit('prubea', info);       
    
        info.forEach(element => {
            const dataInfo = element.split(":");

            //Dato de inicializacion para el sistema
            if (dataInfo[0] == "init" && iniStatus) {
                arduinoInfo.infoArduino = info
                arduinoInfo.status = "active"
                iniStatus = false
                io.emit("ifArduino", arduinoInfo)
            }

            switch(dataInfo[0]){
                case 'i':
                    if (dataInfo[1]) {
                        if (arduinoInfo.status == "active" && arduinoInfo.itemStatus && !arduinoInfo.doorAuthorizedOpen && !arduinoInfo.eventStatus) {
                            if (dataInfo[1] == 1) {
                                generateEvents(61, arduinoInfo)
                            }
                        }
                        io.emit("infrarojo", dataInfo[1]) ;     
                    }
                    break;
                case 'p':
                    if (dataInfo[1]) {
                        if (arduinoInfo.status == "active" && arduinoInfo.itemStatus && !arduinoInfo.doorAuthorizedOpen && !arduinoInfo.eventStatus) {
                            if (dataInfo[1] == 1) {
                                generateEvents(60, arduinoInfo)
                            }
                        }

                        // console.log("Puerta: "+dataInfo[1])    
                        io.emit("puerta", dataInfo[1]) ;  
                    }
                    break;
                case 'k':
                    if (dataInfo[1]) {
                        // console.log("Teclado: "+dataInfo[1])    
                        if (arduinoInfo.status == "active" && arduinoInfo.itemStatus && !arduinoInfo.eventStatus) {

                            if (!arduinoInfo.doorAuthorizedOpen) {
                                if (dataInfo[1] == 1) {

                                    huellaAction(dataInfo[1])
                                    openDoor()
    
                                }else if (dataInfo[1] == 2){
                                    openDoor()
                                    huellaAction(dataInfo[1])
    
                                }else if (dataInfo[1] == 3){
                                    // openDoor()
                                    // huellaAction(dataInfo[1])
    
                                }else if (dataInfo[1] == 4){
    
                                    // huellaAction(dataInfo[1])
                                    // closeDoor()
                                }
                            }else{
                                if (dataInfo[1] == 4) {
                                    closeDoor()
                                    arduinoInfo.doorAuthorizedOpen = false
                                    arduinoInfo.eventStatus = false
                                }
                            }

                        }
                        io.emit("huella", dataInfo[1]) ;  
                    }
                    break;
                case 'g':
                    if (dataInfo[1]) {
                        if (arduinoInfo.status == "active" && arduinoInfo.itemStatus && !arduinoInfo.eventStatus) {
                            if (!arduinoInfo.doorAuthorizedOpen) {
                                const peso = arduinoInfo.item.peso
                                if (dataInfo[1] <  peso-5 || dataInfo[1] > peso +5) {
                                    generateEvents(63, arduinoInfo)
                                }                              
                            }
                        }
                        // console.log("Gramos: "+dataInfo[1])   
                        io.emit("gramos", dataInfo[1]) ;    
                    }
                    break;
                case 't':
                    if (dataInfo[1] == 1) {
                        io.emit('peso' , {status: "ready"})
                    }
            }
        });

        console.log(data.toString())
        console.log("---------------")
    
    })

    const openDoor = () => {
        mySerial.write('b')
    }

    const closeDoor = () => {
        mySerial.write('a')
    }
})



//Funcion para la simulaion 
const huellaAction = async (huellaNumber) => {
    const userHuella = await UserAccess.findOne({huella: huellaNumber})
    console.log(userHuella)
    if (userHuella.status.toLowerCase() == "activo") {
        generateEvents(50, arduinoInfo, userHuella.name);       
        arduinoInfo.doorAuthorizedOpen = true        
    }else{
        generateEvents(31, arduinoInfo, userHuella.name);                   
    }
}

//Generacion de eventos
const generateEvents = async (codigo, arduino, idUserA= "") => {   
    //error 
    const infoAlerta = hanldeEvents(codigo, arduino, idUserA)
    const newEvent = new Event(infoAlerta)
    const data = await newEvent.save()    
    arduinoInfo.eventStatus = true;
    const dataEvent = {
        data,
        eventStatus: true
    }
    io.emit('Event', dataEvent);
}

const hanldeEvents = (codigo, arduino, idUserA= "") => {
    const nameItem = arduino.item.name
    const arduinoCode = arduino.infoArduino[2].split(":")[1]

    switch(codigo){
        case 50:            
            return {
                codigo: codigo,
                title: "Acceso Permitido",
                description: `Acceso permitido a la Vitrina Codigo: "${arduinoCode}" por ${idUserA}`,
                type: "acceso" 
            }
            break
        case 30:
            return {
                codigo: codigo,
                title: "Acceso Denegado",
                description: `Acceso denegado a la Vitrina Codigo: "${arduinoCode}" por usuario desconocido`,
                type: "acceso" 
            }
            break
        case 31:
            return {
                codigo: codigo,
                title: "Acceso Denegado",
                description: `Acceso denegado a la Vitrina Codigo: "${arduinoCode}" por usuario ${idUserA}`,
                type: "aviso" 
            }
            break
        case 60:
            return {
                codigo: codigo,
                title: "Alerta de Seguridad",
                description: `La puerta de la Vitrina Codigo: "${arduinoCode}" con el producto "${nameItem}" Codigo: "${arduino.actualIteam}" se ha abierto sin autorizacion`,
                type: "alerta" 
            }
            break
        case 61:
            return {
                codigo: codigo,
                title: "Alerta de Seguridad",
                description: `Se ha retirado el producto "${nameItem}" Codigo: "${arduino.actualIteam}" de la Vitrina Codigo: "${arduinoCode}" sin autorizacion`,
                type: "alerta" 
            }
            break
        case 62:
            return {
                codigo: codigo,
                title: "Alerta de Seguridad",
                description: `Se ha desconectado la Vitirina Codigo: "${arduinoCode}" sin haber retirado el producto "${nameItem}" Codigo: "${arduino.actualIteam}"`,
                type: "alerta" 
            }
            break
        case 63:
            return {
                codigo: codigo,
                title: "Alerta de Seguridad",
                description: `Se ha detectado una variacion en el peso del producto "${nameItem}" Codigo: "${arduino.actualIteam}" en la Vitrina Codigo: "${arduinoCode}"`,
                type: "alerta" 
            }
            break
        case 20:
            return {
                codigo: codigo,
                title: "Aviso",
                description: `Se ha activo la Vitirina Codigo: "${arduinoCode}" con el producto "${nameItem}" Codigo: "${arduino.actualIteam}"`,
                type: "aviso" 
            }
            break
        case 21:
            return {
                codigo: codigo,
                title: "Aviso",
                description: `Se ha desconectado la Vitrina Codigo: "${arduinoCode}"`,
                type: "aviso" 
            }
            break
        case 22:
            return {
                codigo: codigo,
                title: "Aviso",
                description: `Se ha conectado la Vitrina Codigo: "${arduinoCode}"`,
                type: "aviso" 
            }
            break
        case 23:
            return {
                codigo: codigo,
                title: "Aviso",
                description: `Se ha desactivado la Vitirina Codigo: "${arduinoCode}" con el producto "${nameItem}" Codigo: "${arduino.actualIteam}"`,
                type: "aviso" 
            }
            break
    }
}

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

//Server is listenning
server.listen(app.get('port'), () => {
    console.log('Server in port: ', app.get('port'));
});