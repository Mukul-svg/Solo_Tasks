const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/tasks', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const taskSchema = new mongoose.Schema({
  name: String,
  date: { type: Date, default: Date.now },
  completed: Boolean,
  person: String,
});

const Task = mongoose.model('Tasks', taskSchema);

const personSchema = new mongoose.Schema({
  name: String,
  points: { type: Number, default: 0 },
});

const Person = mongoose.model('Persons', personSchema);

const initialPersons = [
  { name: 'Mukul', points: 0 },
  { name: 'Aryan', points: 0 },
  { name: 'Atharva', points: 0 },
  { name: 'Rachit', points: 0 },
];

const initialTasks = [
  { name: 'Coding Questions', completed: false },
  { name: 'Make Bed', completed: false },
  { name: 'Exercise', completed: false },
];

// Check if persons exist before inserting
initialPersons.forEach(async (person) => {
  try {
    const existingPerson = await Person.findOne({ name: person.name });
    if (!existingPerson) {
      const newPerson = await new Person(person).save();

      // Assign three tasks to each person individually
      for (let i = 0; i < initialTasks.length; i++) {
        const task = { ...initialTasks[i], person: newPerson.name };
        await new Task(task).save();
      }
    }
  } catch (error) {
    console.error('Error checking and adding person:', error);
  }
});

cron.schedule('0 0 * * *', async () => {
  try {
    await Task.updateMany({ completed: true }, { $set: { completed: false } });
    console.log('Tasks reset successfully!');
  } catch (error) {
    console.error('Error resetting tasks:', error);
  }
});

app.post('/api/tasks/:person/:taskId/complete', async (req, res) => {
  const { person, taskId } = req.params;

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!task.completed && task.person === person) {
      task.completed = true;
      await task.save();

      const personInfo = await Person.findOne({ name: person });
      if (personInfo) {
        personInfo.points += 1;
        await personInfo.save();
      }
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error completing task' });
  }
});

app.get('/api/tasks/:person', async (req, res) => {
  const { person } = req.params;

  try {
    const tasks = await Task.find({ person }).sort({ date: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

app.get('/api/persons/:person', async (req, res) => {
  const { person } = req.params;

  try {
    const personInfo = await Person.findOne({ name: person });
    res.json(personInfo);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching person info' });
  }
});

app.get('/api/completed-tasks/:person', async (req, res) => {
  const { person } = req.params;

  try {
    const completedTasks = await Task.aggregate([
      {
        $match: { completed: true, person },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json(completedTasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching completed tasks' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
