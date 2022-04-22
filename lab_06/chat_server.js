const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");


// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body
    const { username, avatar, name, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = 
        JSON.parse(fs.readFileSync("data/users.json"));
    //console.log(users);
    //
    // E. Checking for the user data correctness
    //
    if (!username || !avatar || !name || !password){
        res.json({ status: "error", error: "Username/avatar/name/password cannot be empty"});
        return;
    }
    if (username)
        if (!containWordCharsOnly(username)){
            res.json({status: "error", error: "invalid username"});
            return;
    }
    if (username in users){
        res.json({status: "error", error: "This username has already been used"});
        return;
    }
    //
    // G. Adding the new user account
    //
    const hash = bcrypt.hashSync(password, 10);
    users[username] = {avatar, name, password: hash};
    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("data/users.json",
        JSON.stringify(users, null, "  "));
    //
    // I. Sending a success response to the browser
    //
    res.json({ status: "success" });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = 
        JSON.parse(fs.readFileSync("data/users.json"));
    //console.log(users);
    //
    // E. Checking for username/password
    //
    if (!(username in users)){
        res.json({status: "error", error: "Incorrect username"});
        return;
    }
    const hashedPassword = users[username].password;
    if (!bcrypt.compareSync(password, hashedPassword)) {
        res.json({status: "error", error: "Incorrect password"});
        return;
    }
    //
    // G. Sending a success response with the user account
    //
    avatar = users[username].avatar; 
    nm = users[username]["name"]; 
    user = {username, avatar, name: nm };
    req.session.user = user;
    res.json({ status: "success", user});
});

// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    user = req.session.user;
    //
    // D. Sending a success response with the user account
    //
    if (user != null){
        res.json({ status: "success", user});
        return;
    }
    res.json({status: "error", error: "no user has signed in yet"});
    return;
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    req.session.user = null;
    //
    // Sending a success response
    //
    res.json({ status: "success"});
    return;
});


//
// ***** Please insert your Lab 6 code here *****
//
const { createServer} = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer);
io.use((socket, next) => {
    chatSession(socket.request, {}, next);
});

const onlineUsers = {};

io.on("connection", (socket) =>{
    //Add a new user to the online user list
    if (socket.request.session.user){
        const {username, avatar, name} = socket.request.session.user;
        onlineUsers[username] = {avatar, name};
        //console.log(onlineUsers);

        //Broadcast the signed-in user
        io.emit("add user", JSON.stringify(socket.request.session.user));
    }
    socket.on("disconnect", ()=>{
    //Remove the user from the online user list
    if (socket.request.session.user){
        const {username} = socket.request.session.user;
        if (onlineUsers[username]){
            delete onlineUsers[username];
        }
        //console.log(onlineUsers);
        // Broadcast the signed-in user
        io.emit("remove user", JSON.stringify(socket.request.session.user));
    }
    });
    socket.on("get users", ()=>{
        // Send the online users to the browser
        io.emit("users", JSON.stringify(onlineUsers));
    });
    socket.on("get messages",()=>{
        // Send the chatroom messages to the browser
        const chatroom = JSON.parse(fs.readFileSync("data/chatroom.json"));
        //console.log(chatroom);
        io.emit("messages", JSON.stringify(chatroom));
    });
    socket.on("post message",(content)=>{
        // Add the message to the chatroom
        message = {
            user: socket.request.session.user,
            datetime: new Date(),
            content: content
        }
        const chatroom = JSON.parse(fs.readFileSync("data/chatroom.json"));
        chatroom.push(message);
        fs.writeFileSync("data/chatroom.json",
            JSON.stringify(chatroom));
        io.emit("add message",  JSON.stringify(message));
    });

    socket.on("typing",()=>{
        const user  = socket.request.session.user;
        io.emit("typing", JSON.stringify(user));
    });
});



// Use a web server to listen at port 8000
httpServer.listen(8000, () => {
    console.log("The chat server has started...");
});
