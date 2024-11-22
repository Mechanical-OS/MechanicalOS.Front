import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ToDoItem } from './todo.model';

@Component({
  selector: 'app-widget-todo',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})

export class TodoComponent implements OnInit {

  @Input() toDoItems: ToDoItem[] = [];
  @Input() height: number = 0;
  @Input() archivable: boolean = false;
  @Input() addable: boolean = false;
  newTask: string = '';
  submitted: boolean = false;

  @Output() archiveTodos = new EventEmitter<any>();
  @Output() addTask = new EventEmitter<string>();

  @ViewChild('addTodo', { static: true }) addTodo!: any;

  constructor () { }

  ngOnInit(): void {
  }

  /**
   * changes status of todo item
   * @param todoItem todo item
   */
  toggleTodo(todoItem: ToDoItem): void {
    todoItem.completed = !todoItem.completed;
  }

  /**
   * archive completed tasks
   */
  archiveTasks(): void {
    this.archiveTodos.emit();
  }

  /**
   * add new task in todo list
   */
  addNewTask(): void {
    this.submitted = true;
    if (this.newTask !== '') {
      this.addTask.emit(this.newTask);
      this.newTask = '';
      this.submitted = false;
    }
  }

  /**
   * Returns the remaining todos
   */
  getInprogressTodoCount(): number {
    return this.toDoItems.filter((todoItem: ToDoItem) => todoItem.completed === false).length
  }
}
