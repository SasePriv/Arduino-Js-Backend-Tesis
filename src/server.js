const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;


const mySerial = new SerialPort("\\\\.\\COM3", {
    baudRate: 500000
});

const parser = mySerial.pipe(new Readline({delimeter: '\r\n'}));

// mySerial.pipe(parser);

parser.on('open', function(){
    console.log('Opened serial Port');
})

parser.on('data', (data) => {
    // console.log("Datos: "+ data.toString());
    const info = data.toString().split(",");
    info.forEach(element => {
        const dataInfo = element.split(":");
        switch(dataInfo[0]){
            case "i":
                if (dataInfo[1]) {
                    console.log("Infrarrojo Status: "+dataInfo[1])    
                }
                break;
            case "p":
                if (dataInfo[1]) {
                    console.log("Puerta: "+dataInfo[1])    
                }
                break;
            case "k":
                if (dataInfo[1]) {
                    console.log("Teclado: "+dataInfo[1])    
                }
                break;
            case "g":
                if (dataInfo[1]) {
                    console.log("Gramos: "+dataInfo[1])    
                }
                break;
        }
    });
    console.log(data.toString())
    console.log("---------------")

})
