import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Student } from '../../models/student.interface';

@Component({
  selector: 'app-student-table',
  standalone: true,
  templateUrl: './student-table.component.html',
  styleUrls: ['./student-table.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
})
export class StudentTableComponent implements OnChanges {
  // Input properties from parent component
  @Input() students: Student[] = [];

  // Output events to parent component
  @Output() studentSave = new EventEmitter<Student>();
  @Output() studentDelete = new EventEmitter<number>();

  // Form management
  studentForm: FormGroup;
  isFormVisible: boolean = false;
  isEditMode: boolean = false;
  editingStudentId: number | null = null;

  // Filtered data and search filters
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

  constructor(private fb: FormBuilder) {
    this.studentForm = this.createForm();
  }

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

  /**
   * Get active filter count for display
   */
  getActiveFilterCount(): number {
    return Object.values(this.searchFilters).filter(value => value.trim() !== '').length;
  }

  /**
   * Create reactive form with validation
   */
  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', Validators.required],
      middleName: ['', Validators.required],
      lastName: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(11)]],
      class: ['', Validators.required],
      division: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Show form for adding new student
   */
  onAddStudent(): void {
    this.isEditMode = false;
    this.editingStudentId = null;
    this.studentForm.reset();
    this.isFormVisible = true;
    this.scrollToForm();
  }

  /**
   * Show form for editing existing student
   */
  onEditStudent(student: Student): void {
    this.isEditMode = true;
    this.editingStudentId = student.id;
    this.studentForm.patchValue({
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      age: student.age,
      class: student.class,
      division: student.division,
      dateOfBirth: new Date(student.dateOfBirth),
      email: student.email
    });
    this.isFormVisible = true;
    this.scrollToForm();
  }

  /**
   * Delete student
   */
  onDeleteStudent(student: Student): void {
    if (confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      this.studentDelete.emit(student.id);
    }
  }

  /**
   * Save form data
   */
  onSaveStudent(): void {
    if (this.studentForm.valid) {
      const formValue = this.studentForm.value;
      const student: Student = {
        id: this.isEditMode ? this.editingStudentId! : Date.now(),
        firstName: formValue.firstName,
        middleName: formValue.middleName,
        lastName: formValue.lastName,
        age: formValue.age,
        class: formValue.class,
        division: formValue.division,
        dateOfBirth: this.formatDateToString(formValue.dateOfBirth),
        email: formValue.email
      };

      this.studentSave.emit(student);
      this.cancelForm();
    }
  }

  /**
   * Cancel and hide form
   */
  cancelForm(): void {
    this.isFormVisible = false;
    this.isEditMode = false;
    this.editingStudentId = null;
    this.studentForm.reset();
  }

  /**
   * Format date to string for storage
   */
  formatDateToString(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Scroll to form section
   */
  scrollToForm(): void {
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