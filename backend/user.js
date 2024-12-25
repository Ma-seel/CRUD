const mongoose = require('mongoose');
 

const userAuthSchema = new mongoose.Schema({
       username: {
               type : String,
               required: [true, 'Username can not be empty']
       },

       password: {  type: String ,
        required : [true, 'Password should be filled']
       }
}) 

module.exports  = mongoose.model('User',userAuthSchema)