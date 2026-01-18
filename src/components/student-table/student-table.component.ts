import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { Student } from '../../models/student.interface';
import { StudentFormComponent } from '../student-form/student-form.component';

@Component({
  selector: 'app-student-table',
  standalone: true,
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatChipsModule,
    StudentFormComponent
  ],
})
export class StudentTableComponent implements OnChanges {
  @Input() students: Student[] = [];

  @Output() studentSave = new EventEmitter<Student>();
  @Output() studentDelete = new EventEmitter<number>();

  isFormVisible = false;
  selectedStudent: Student | null = null;

  dataSource = new MatTableDataSource<Student>([]);
  searchFilters = {
    firstName: '',
    middleName: '',
    lastName: '',
    age: '',
    class: '',
    division: '',
    dateOfBirth: '',
    email: ''
  };

  // Table columns configuration
  displayedColumns: string[] = [
    'firstName', 
    'middleName', 
    'lastName', 
    'age', 
    'class', 
    'division', 
    'dateOfBirth', 
    'email', 
    'actions'
  ];

  // Filter row columns
  filterColumns: string[] = [
    'firstName-filter',
    'middleName-filter', 
    'lastName-filter',
    'age-filter',
    'class-filter',
    'division-filter',
    'dateOfBirth-filter',
    'email-filter',
    'actions-filter'
  ];

  ngOnChanges(): void {
    this.dataSource.data = this.students;
    this.applyFilters();
  }

  /**
   * Apply search filters to the student data
   */
  applyFilters(): void {
    const filteredData = this.students.filter(student => {
      return (
        student.firstName.toLowerCase().includes(this.searchFilters.firstName.toLowerCase()) &&
        student.middleName.toLowerCase().includes(this.searchFilters.middleName.toLowerCase()) &&
        student.lastName.toLowerCase().includes(this.searchFilters.lastName.toLowerCase()) &&
        student.age.toString().includes(this.searchFilters.age) &&
        student.class.toLowerCase().includes(this.searchFilters.class.toLowerCase()) &&
        student.division.toLowerCase().includes(this.searchFilters.division.toLowerCase()) &&
        this.formatDate(student.dateOfBirth).toLowerCase().includes(this.searchFilters.dateOfBirth.toLowerCase()) &&
        student.email.toLowerCase().includes(this.searchFilters.email.toLowerCase())
      );
    });
    this.dataSource.data = filteredData;
  }

  /**
   * Handle search input changes
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Clear all search filters
   */
  clearAllFilters(): void {
    this.searchFilters = {
      firstName: '',
      middleName: '',
      lastName: '',
      age: '',
      class: '',
      division: '',
      dateOfBirth: '',
      email: ''
    };
    this.applyFilters();
  }

  getActiveFilterCount(): number {
    return Object.values(this.searchFilters).filter(value => value.trim() !== '').length;
  }

  onAddStudent(): void {
    this.selectedStudent = null;
    this.isFormVisible = true;
    this.scrollToForm();
  }

  onEditStudent(student: Student): void {
    this.selectedStudent = student;
    this.isFormVisible = true;
    this.scrollToForm();
  }

  onDeleteStudent(student: Student): void {
    const confirmed = confirm(
      `Are you sure you want to delete ${student.firstName} ${student.lastName}?`
    );

    if (confirmed) {
      this.studentDelete.emit(student.id);
    }
  }

  onFormSubmit(student: Student): void {
    this.studentSave.emit(student);
    this.closeForm();
  }

  onFormCancel(): void {
    this.closeForm();
  }

  private closeForm(): void {
    this.isFormVisible = false;
    this.selectedStudent = null;
  }

  private scrollToForm(): void {
    setTimeout(() => {
      const formElement = document.querySelector('.student-form-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  /**
   * Format date for display in table
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}


