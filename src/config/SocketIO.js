const Server = require("socket.io").Server;
const http = require("http");

const SocketIO = (app) => {
    const server = http.createServer(app);
    const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: [
                "https://manage-montalban-admin.netlify.app",
                "https://manage-montalban-brgy.netlify.app",
                "https://ebrgy-montalban.netlify.app",
                "http://localhost:5173",
                "http://localhost:5174",
                "http://192.168.0.111:8081",
            ],
        },
    });

    io.on("connection", (socket) => {
        console.log("Connected to Socket.io");

        socket.on("setup", (userData) => {
            socket.join(userData._id);
            socket.emit("connected");
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from Socket.io");
        });

        // SENDING EVENT APPLICATIONS
        socket.on("send-event-appli", (obj) => {
            io.emit("receive-event-appli", obj);
        });

        // REPLYING EVENT APPLICATIONS
        socket.on("send-reply-event-appli", (obj) => {
            io.emit("receive-reply-event-appli", obj);
        });

        // SENDING SERVICE REQUEST
        socket.on("send-service-req", (obj) => {
            io.emit("receive-service-req", obj);
        });

        // REPLY SERVICE REQUEST
        socket.on("send-reply-service-req", (obj) => {
            io.emit("receive-reply-service-req", obj);
        });

        // SENDING STAFF INQUIRY
        socket.on("send-staff-inquiry", (obj) => {
            io.emit("receive-staff-inquiry", obj);
        });

        // REPLY STAFF INQUIRY
        socket.on("send-reply-staff-inquiry", (obj) => {
            io.emit("receive-reply-staff-inquiry", obj);
        });

        // SENDING MUNI INQUIRY
        socket.on("send-muni-inquiry", (obj) => {
            io.emit("receive-muni-inquiry", obj);
        });

        // REPLY MUNI INQUIRY
        socket.on("send-reply-muni-inquiry", (obj) => {
            io.emit("receive-reply-muni-inquiry", obj);
        });

        // CREATING EVENT
        socket.on("send-get-event", (obj) => {
            io.emit("receive-get-event", obj);
        });

        // UPDATING EVENT
        socket.on("send-update-event", (obj) => {
            io.emit("receive-update-event", obj);
        });

        // CREATE EVENT FORMS
        socket.on("send-create-event-form", (obj) => {
            io.emit("receive-create-event-form", obj);
        });

        // EDITING EVENT FORMS
        socket.on("send-edit-event-form", (obj) => {
            io.emit("receive-edit-event-form", obj);
        });

        // CREATING SERVICE
        socket.on("send-get-service", (obj) => {
            io.emit("receive-get-service", obj);
        });

        // EDITING SERVICE FORM
        socket.on("send-edit-service-form", (obj) => {
            io.emit("receive-edit-service-form", obj);
        });

        // EDITING SERVICE DOCUMENT
        socket.on('send-edit-service-doc', (obj) => {
            io.emit('receive-edit-service-doc', obj)
        })

        // EDITING PATAWAG
        socket.on('send-patawag', (obj) => {
            io.emit('receive-patawag', obj)
        })

        // CREATE PATAWAG DOCUMENT
        socket.on("send-create-patawag-doc", (obj) => {
            io.emit("receive-create-patawag-doc", obj);
        });

        socket.on('send-muni-about', (obj) => {
            io.emit('receive-muni-about', obj)
        })

        socket.on('send-offered-serv', (obj) => {
            io.emit('receive-offered-serv', obj)
        })

        socket.on('send-tourist-spot', (obj) => {
            io.emit('receive-tourist-spot', obj)
        })

        socket.on('send-muni-official', (obj) => {
            io.emit('receive-muni-official', obj)
        })

        socket.on('send-muni-admin', (obj) => {
            io.emit('receive-muni-admin', obj)
        })

        socket.on('send-brgy-admin', (obj) => {
            io.emit('receive-brgy-admin', obj)
        })

        // UPDATE STATUS RESIDENT
        socket.on("send-update-status-resident", (obj) => {
            io.emit("receive-update-status-resident", obj);
        });

        // CREATE STAFF
        socket.on("send-create-staff", (obj) => {
            io.emit("receive-create-staff", obj);
        });

        // UPDATE STAFF
        socket.on("send-update-staff", (obj) => {
            io.emit("receive-update-staff", obj);
        });

        // UPDATE PROFILE
        socket.on("send-update-profile", (obj) => {
            io.emit("receive-update-profile", obj);
        });
    })

    return server;
};

module.exports = SocketIO;
