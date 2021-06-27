const express = require('express');
const app = express();


//Connecting to mongodb
const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');

app.use(bodyParser.json());

//CORS HEADER MIDDLEWARE
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PATCH");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });


//Load in the mongoose mondels
const { List, Task, User } = require('./db/models');


/**
 * Get, Create, Update and Delete a List
 */

//Get the lists
app.get('/lists', (req,res) => {
    List.find({}).then((lists) => {
        res.send(lists);
    })
});


//Create a new list
app.post('/lists', (req,res) => {
    let title = req.body.title;

    let newList = new List({
        title
    });
    newList.save().then((listDoc) => {
        // the full list document is returned (incl. id)
        res.send(listDoc);
    })
});


//Update a list
app.patch('/lists/:id', (req,res) => {
    List.findOneAndUpdate({_id: req.params.id}, {
        $set: req.body
    }).then(() => {
        res.send({'message': 'Updated Successfully'});
    });
});


//Delete a list
app.delete('/lists/:id', (req,res) => {
    List.findOneAndRemove({
        _id: req.params.id
    }).then((removedListDoc) => {
        res.send(removedListDoc);
    });
});


/**
 * Get, Create, Update and Delete a task under a specific ListID
 */

//Get all the task under specific ID
app.get('/lists/:listId/tasks', (req, res) => {
    Task.find({
        _listId: req.params.listId
    }).then((tasks) => {
        res.send(tasks);
    });
});

//Get a task under a specific ID
// app.get('/lists/:listId/tasks/:taskId', (req, res) => {
//     Task.findOne({
//         _id: req.params.taskId,
//         _listId: req.params.listId
//     }).then((task) => {
//         res.send(task);
//     });
// });

//Create a new task under a specific ID
app.post('/lists/:listId/tasks', (req, res) => {
    let newTask = new Task({
        title: req.body.title,
        _listId: req.params.listId
    });

    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
    });
});

//Update a task under a specific ID
app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndUpdate({
        _id: req.params.taskId,
        _listId: req.params.listId
    }, {
            $set: req.body
        }
    ).then(() => {
        res.send({'message': 'Updated Successfully'});
    });
});

//Delete a task under a specific ID
app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndRemove({
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
    });
})

//SignUp
app.post('/users', (req, res) => {
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();

    }).then((refreshToken) => {
        return newUser.generateAccessAuthToken().then((accessToken) => {
            return{accessToken, refreshToken};
        })

    }).then((authToken) => {
        res
            .header('x-refresh-token', authToken.refreshToken)
            .header('x-access-token', authToken.accessToken)
            .send(newUser);
    }).catch((e) => {
        res.status(400).send(e);
    })
})

//Login
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            
        })
    })
})

app.listen(3000, () => {
    console.log('Server is listening at port 3000');
});