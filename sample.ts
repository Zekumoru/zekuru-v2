import mongoose from 'mongoose';

export interface Common {
  createdAt: Date;
  createdBy: string;
}

export class Task implements Common {
  constructor(
    public _id: string,
    public title: string,
    public description: string,
    public isCompleted: boolean,
    public createdAt: Date,
    public createdBy: string
  ) {}
}

// Task class can be used as an interface
const taskSchema = new mongoose.Schema<Task>({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isCompleted: { type: Boolean, required: true },
});

export const TaskModel = mongoose.model<Task>('task', taskSchema);

// We can pass a TaskModel instance like a Task instance here!
const tickTask = (task: Task) => {
  task.isCompleted = !task.isCompleted;
};

const task = new TaskModel({
  _id: '123',
  title: 'Task',
  description: 'A sample task.',
  isCompleted: false,
});

tickTask(task);

console.log(task.toObject()); // { _id: '123', title: 'Task', description: 'A sample task.', isCompleted: true }
// note: `toObject()` converts the task document into a POJO (Plain Old JavaScript Object) removing Mongoose's properties, virtuals, etc.
