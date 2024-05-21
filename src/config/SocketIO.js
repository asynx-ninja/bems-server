const Server = require('socket.io').Server
const http = require('http')

const SocketIO = (app) => {
    const server = http.createServer(app)
    const io = new Server(server, {
        pingTimeout: 60000,
        cors: {
            origin: ['https://manage-montalban-admin.netlify.app', 'https://manage-montalban-brgy.netlify.app', 'https://ebrgy-montalban.netlify.app', 'http://localhost:5173', 'http://localhost:5174'],
        },
    })

    io.on('connection', (socket) => {
        console.log('Connected to Socket.io')

        socket.on('setup', (userData) => {
            socket.join(userData._id)
            socket.emit('connected')
        })
        socket.on('disconnect', () => {
            console.log('Disconnected')
        })

        socket.on('send-event_appli', (event_appli) => {
            // socket.join(inquiry.id)
            console.log(event_appli)
            io.emit('receive-event_appli', event_appli)
        })

        socket.on('send-muni_inquiry', (muni_inquiry) => {
            // socket.join(inquiry.id)
            console.log(muni_inquiry)
            io.emit('receive-muni_inquiry', muni_inquiry)
        })

        socket.on('send-staff_inquiry', (staff_inquiry) => {
            // socket.join(inquiry.id)
            console.log(staff_inquiry)
            io.emit('receive-staff_inquiry', staff_inquiry)
        })

        socket.on('send-get_events', (get_events) => {
            // socket.join(inquiry.id)
            console.log(get_events)
            io.emit('receive-get_events', get_events)
        })

        socket.on('send-get_events_forms', (get_events_forms) => {
            // socket.join(inquiry.id)
            console.log(get_events_forms)
            io.emit('receive-get_events_forms', get_events_forms)
        })

        socket.on('send-edit_events_forms', (edit_events_forms) => {
            // socket.join(inquiry.id)
            console.log(edit_events_forms)
            io.emit('receive-edit_events_forms', edit_events_forms)
        })
    })

    return server;
}


module.exports = SocketIO;