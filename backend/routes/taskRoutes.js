const express = require('express')
const router = express.Router()
const auth = require('../middleware/authMiddleware')
const {createTask, getTasks, updateTask, deleteTask, smartAssign} = require('../controllers/taskController')

router.post('/', auth, createTask)
router.get('/', auth, getTasks)
router.put('/:id', auth, updateTask)
router.delete('/:id', auth, deleteTask)
router.post('/smart-assign/:taskId', auth, smartAssign)

module.exports = router