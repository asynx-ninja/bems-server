const Server = require('socket.io').Server
const http = require('http')

const SocketIO = (app) => {
    const server = http.createServer(app)
    const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: ['https://manage-montalban-admin.netlify.app', 'https://manage-montalban-brgy.netlify.app', 'https://ebrgy-montalban.netlify.app', 'http://localhost:5173', 'http://localhost:5174', 'http://192.168.0.111:8081'],
        },
    })

    const users = {};

    io.on('connection', (socket) => {
        console.log('Connected to Socket.io')

        socket.on('setup', (userData) => {
            socket.join(userData._id)
            socket.emit('connected')
        })

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.io')
        })

        // SENDING EVENT APPLICATIONS
        socket.on('send-event-appli', (obj) => {
            io.emit('receive-event-appli', obj)
        })

        // REPLYING EVENT APPLICATIONS
        socket.on('send-reply-event-appli', (obj) => {
            io.emit('receive-reply-event-appli', obj)
        })

        // SENDING SERVICE REQUEST
        socket.on('send-service-req', (obj) => {
            io.emit('receive-service-req', obj)
        })

        // REPLY SERVICE REQUEST
        socket.on('send-reply-service-req', (obj) => {
            io.emit('receive-reply-service-req', obj)
        })

        // SENDING STAFF INQUIRY
        socket.on('send-staff-inquiry', (obj) => {
            io.emit('receive-staff-inquiry', obj)
        })

        // REPLY STAFF INQUIRY
        socket.on('send-reply-staff-inquiry', (obj) => {
            io.emit('receive-reply-staff-inquiry', obj)
        })

        // SENDING MUNI INQUIRY
        socket.on('send-muni-inquiry', (obj) => {
            io.emit('receive-muni-inquiry', obj)
        })

        // REPLY MUNI INQUIRY
        socket.on('send-reply-muni-inquiry', (obj) => {
            io.emit('receive-reply-muni-inquiry', obj)
        })

        // CREATING EVENT
        socket.on('send-get-event', (obj) => {
            io.emit('receive-get-event', obj)
        })

        // EDITING EVENT FORMS
        socket.on('send-edit-event-form', (obj) => {
            io.emit('receive-edit-event-form', obj)
        })

        // CREATING SERVICE
        socket.on('send-get-service', (obj) => {
            io.emit('receive-get-service', obj)
        })

        // EDITING SERVICE FORM
        socket.on('send-edit-service-form', (obj) => {
            io.emit('receive-edit-service-form', obj)
        })

        // EDITING SERVICE DOCUMENT
        socket.on('send-edit-service-doc', (obj) => {
            io.emit('receive-edit-service-doc', obj)
        })

        // EDITING PATAWAG
        socket.on('send-patawag', (obj) => {
            io.emit('receive-patawag', obj)
        })
    })

    return server;
}


module.exports = SocketIO;