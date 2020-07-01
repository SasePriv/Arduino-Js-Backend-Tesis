const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/joyeria-db', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
})
.then(db => console.log('Db is Connect'))
.catch(err => console.log(err)); 