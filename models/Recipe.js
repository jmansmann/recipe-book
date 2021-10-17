var mongoose = require('mongoose');

var recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        minlength: 1,
        maxlength: 30
    },
    meal: {
        
    }
});