const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')

const http = require('http')

const socket = require('./socket')

//config
dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

//mddlewares
app.use(cors({
  origin: "https://realtime-collab-kanban.vercel.app", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}))
app.use(express.json())

//test route
app.get('/', (req, res) => {
    res.send('API is running ........')
})

const authRoutes = require('./routes/authRoutes')
app.use('/api/auth', authRoutes)

const taskRoutes = require('./routes/taskRoutes')
app.use('/api/tasks', taskRoutes)

// const actionRoutes = require('./routes/actionRoutes');
// app.use('/api/actions', actionRoutes);

// http server and socket.Io server
const server = http.createServer(app)
const io = socket.init(server)


//connect MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected')
    // app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    server.listen(PORT, () => console.log(`Server running with Socket.IO on port ${PORT}`))
})
.catch((err) => {
    console.error(`MongoDB connection error:`, err.message)
})