import { Component, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { StudentTableComponent } from './components/student-table/student-table.component';
import { StudentModalComponent } from './components/student-modal/student-modal.component';
import { Student, ModalData } from './models/student.interface';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './main.html',
  styleUrls: ['./main.css'],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatSnackBarModule,
    StudentTableComponent,
    StudentModalComponent
  ],
})
export class App implements OnInit {
  // Core data management
  students: Student[] = [];
  
  // Modal state management
  isModalVisible: boolean = false;
  currentModalData: ModalData | null = null;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.initializeSampleData();
  }

  /**
   * Initialize application with sample student data
   */
  private initializeSampleData(): void {
    this.students = [
      {
        id: 1,
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Smith',
        age: 16,
        class: '10th',
        division: 'A',
        dateOfBirth: '2007-05-15',
        email: 'john.smith@school.edu'
      },
      {
        id: 2,
        firstName: 'Sarah',
        middleName: 'Elizabeth',
        lastName: 'Johnson',
        age: 17,
        class: '11th',
        division: 'B',
        dateOfBirth: '2006-09-22',
        email: 'sarah.johnson@school.edu'
      },
      {
        id: 3,
        firstName: 'David',
        middleName: 'Robert',
        lastName: 'Brown',
        age: 15,
        class: '9th',
        division: 'C',
        dateOfBirth: '2008-03-10',
        email: 'david.brown@school.edu'
      },
      {
        id: 4,
        firstName: 'Emily',
        middleName: 'Grace',
        lastName: 'Davis',
        age: 18,
        class: '12th',
        division: 'A',
        dateOfBirth: '2005-12-08',
        email: 'emily.davis@school.edu'
      },
      {
        id: 5,
        firstName: 'Michael',
        middleName: 'James',
        lastName: 'Wilson',
        age: 14,
        class: '8th',
        division: 'D',
        dateOfBirth: '2009-07-25',
        email: 'michael.wilson@school.edu'
      }
    ];
  }

  /**
   * Handle modal open requests from student table component
   */
  onModalOpen(modalData: ModalData): void {
    this.currentModalData = modalData;
    this.isModalVisible = true;
  }

  /**
   * Handle modal close events
   */
  onModalClose(): void {
    this.isModalVisible = false;
    this.currentModalData = null;
  }

  /**
   * Handle student save operations (Add/Edit)
   */
  onStudentSave(student: Student): void {
    const existingIndex = this.students.findIndex(s => s.id === student.id);
    
    console.log('Received student save event:', student); // Debug log
    console.log('Existing index:', existingIndex); // Debug log
    
    if (existingIndex >= 0) {
      // Update existing student
      this.students[existingIndex] = student;
      console.log('Updated existing student'); // Debug log
      this.showSuccessMessage(`Student ${student.firstName} ${student.lastName} updated successfully!`);
    } else {
      // Add new student
      this.students.push(student);
      console.log('Added new student, total students:', this.students.length); // Debug log
      this.showSuccessMessage(`Student ${student.firstName} ${student.lastName} added successfully!`);
    }
    
    // Force change detection
    this.students = [...this.students];
  }

  /**
   * Handle student delete operations
   */
  onStudentDelete(studentId: number): void {
    const studentIndex = this.students.findIndex(s => s.id === studentId);
    
    if (studentIndex >= 0) {
      const deletedStudent = this.students[studentIndex];
      this.students.splice(studentIndex, 1);
      this.showSuccessMessage(`Student ${deletedStudent.firstName} ${deletedStudent.lastName} deleted successfully!`);
    }
  }

  /**
   * Show success message using MatSnackBar
   */
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }
}

// Bootstrap the application with required providers
bootstrapApplication(App, {
  providers: [
    provideAnimations()
  ]
}).catch(err => console.error(err));