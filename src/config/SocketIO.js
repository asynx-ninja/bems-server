const Server = require("socket.io").Server;
const http = require("http");

const SocketIO = (app) => {
    const server = http.createServer(app);
    const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            // origin: [
            //     "https://manage-montalban-admin.netlify.app",
            //     "https://manage-montalban-brgy.netlify.app",
            //     "https://ebrgy-montalban.netlify.app",
            //     "http://localhost:5173",
            //     "http://localhost:5174",
            //     "http://192.168.0.111:8081",
            // ],
            origin: '*'
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

        // CREATE SERVICE FORMS
        socket.on("send-service-form", (obj) => {
            io.emit("receive-service-form", obj);
        });

        // CREATING SERVICE
        socket.on("send-get-service", (obj) => {
            io.emit("receive-get-service", obj);
        });

        // EDITING SERVICE
        socket.on("send-updated-service", (obj) => {
            io.emit("receive-updated-service", obj);
        });

        // CREATE SERVICE DOCUMENT FORMS
        socket.on("send-document-form", (obj) => {
            io.emit("receive-document-form", obj);
        });

        // EDITING SERVICE FORM
        socket.on("send-edit-service-form", (obj) => {
            io.emit("receive-edit-service-form", obj);
        });

        // EDITING SERVICE DOCUMENT
        socket.on('send-edit-service-doc', (obj) => {
            io.emit('receive-edit-service-doc', obj)
        })

        // REPLY PATAWAG
        socket.on('send-reply-patawag', (obj) => {
            io.emit('receive-reply-patawag', obj)
        })

        // CREATE PATAWAG DOCUMENT
        socket.on("send-create-patawag-doc", (obj) => {
            io.emit("receive-create-patawag-doc", obj);
        });

        socket.on('send-muni-about', (obj) => {
            io.emit('receive-muni-about', obj)
        })

        socket.on('send-upt-muni-about', (obj) => {
            io.emit('receive-upt-muni-about', obj)
        })

        socket.on('send-offered-serv', (obj) => {
            io.emit('receive-offered-serv', obj)
        })

        socket.on('send-upt-offered-serv', (obj) => {
            io.emit('receive-upt-offered-serv', obj)
        })

        socket.on('send-tourist-spot', (obj) => {
            io.emit('receive-tourist-spot', obj)
        })

        socket.on('send-upt-tourist-spot', (obj) => {
            io.emit('receive-upt-tourist-spot', obj)
        })

        socket.on('send-muni-official', (obj) => {
            io.emit('receive-muni-official', obj)
        })

        socket.on('send-upt-muni-official', (obj) => {
            io.emit('receive-upt-muni-official', obj)
        })

        socket.on('send-muni-admin', (obj) => {
            io.emit('receive-muni-admin', obj)
        })

        socket.on('send-upt-muni-admin', (obj) => {
            io.emit('receive-upt-muni-admin', obj)
        })

        socket.on('send-brgy-admin', (obj) => {
            io.emit('receive-brgy-admin', obj)
        })

        socket.on('send-upt-brgy-admin', (obj) => {
            io.emit('receive-upt-brgy-admin', obj)
        })

        // UPDATE STATUS RESIDENT
        socket.on("send-update-status-resident", (obj) => {
            io.emit("receive-update-status-resident", obj);
        });
        // CREATE STAFF
        socket.on("send-create-staff", (obj) => {
            io.emit("receive-create-staff", obj);
        });
        // CREATE official
        socket.on("send-create-official", (obj) => {
            io.emit("receive-create-official", obj);
        });
        // Update official
        socket.on("send-update-official", (obj) => {
            io.emit("receive-update-official", obj);
        });
        // UPDATE STAFF
        socket.on("send-update-staff", (obj) => {
            io.emit("receive-update-staff", obj);
        });
        // UPDATE PROFILE
        socket.on("send-update-profile", (obj) => {
            io.emit("receive-update-profile", obj);
        });
        // UPDATE info
        socket.on("send-update-brgy-info", (obj) => {
            io.emit("receive-update-brgy-info", obj);
        });

        socket.on("send-resident-notif", (obj) => {
            io.emit("receive-resident-notif", obj);
        });

        socket.on("send-staff-notif", (obj) => {
            io.emit("receive-staff-notif", obj);
        });

        socket.on("send-muni-notif", (obj) => {
            io.emit("receive-muni-notif", obj);
        });
    });

    return server;
};

module.exports = SocketIO;
