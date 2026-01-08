import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Student, ModalData } from '../../models/student.interface';

@Component({
  selector: 'app-student-modal',
  standalone: true,
  templateUrl: './student-modal.component.html',
  styleUrls: ['./student-modal.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
})
export class StudentModalComponent implements OnInit, OnChanges {
  // Input properties from parent component
  @Input() isVisible: boolean = false;
  @Input() modalData: ModalData | null = null;

  // Output events to parent component
  @Output() modalClose = new EventEmitter<void>();
  @Output() studentSave = new EventEmitter<Student>();
  @Output() studentDelete = new EventEmitter<number>();

  // Form and validation properties
  studentForm: FormGroup;
  isLoading: boolean = false;
  maxDate: Date = new Date(2014, 11, 31); // Before January 1, 2015

  // Class and Division options
  classOptions = ['8th', '9th', '10th', '11th', '12th'];
  divisionOptions = ['A', 'B', 'C', 'D'];

  constructor(private formBuilder: FormBuilder) {
    this.studentForm = this.createForm();
  }

  ngOnInit(): void {
    this.setupForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['modalData'] && this.modalData) {
      this.setupForm();
    }
  }

  /**
   * Create reactive form with validation rules
   */
  private createForm(): FormGroup {
    return this.formBuilder.group({
      firstName: ['', [Validators.required]],
      middleName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      age: ['', [Validators.required, Validators.min(10)]],
      class: ['', [Validators.required]],
      division: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required, this.dateValidator.bind(this)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  /**
   * Custom date validator for Angular 18 compatibility
   */
  private dateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const maxDate = new Date(2014, 11, 31);
    
    if (selectedDate > maxDate) {
      return { max: true };
    }
    
    return null;
  }

  /**
   * Setup form based on modal mode and data
   */
  private setupForm(): void {
    if (!this.modalData) return;

    if (this.modalData.mode === 'edit' && this.modalData.student) {
      // Pre-populate form for edit mode
      const student = this.modalData.student;
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
    } else if (this.modalData.mode === 'add') {
      // Reset form for add mode
      this.studentForm.reset();
    }
  }

  /**
   * Get modal title based on current mode
   */
  getModalTitle(): string {
    switch (this.modalData?.mode) {
      case 'add': return 'Add New Student';
      case 'edit': return 'Edit Student';
      case 'delete': return 'Delete Student';
      default: return 'Student Details';
    }
  }

  /**
   * Get title icon based on current mode
   */
  getTitleIcon(): string {
    switch (this.modalData?.mode) {
      case 'add': return 'person_add';
      case 'edit': return 'edit';
      case 'delete': return 'delete';
      default: return 'person';
    }
  }

  /**
   * Handle backdrop click to close modal
   */
  onBackdropClick(event: MouseEvent): void {
    event.stopPropagation();
    this.onCancel();
  }

  /**
   * Handle cancel action
   */
  onCancel(): void {
    this.modalClose.emit();
    this.studentForm.reset();
    this.isLoading = false;
  }

  /**
   * Handle save action for Add/Edit modes
   */
  onSave(): void {
    if (this.studentForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      // Simulate API call delay
      setTimeout(() => {
        const formValue = this.studentForm.value;
        
        // Create student object
        const student: Student = {
          id: this.modalData?.mode === 'edit' && this.modalData?.student?.id ? this.modalData.student.id : Date.now(),
          firstName: formValue.firstName,
          middleName: formValue.middleName,
          lastName: formValue.lastName,
          age: Number(formValue.age),
          class: formValue.class,
          division: formValue.division,
          dateOfBirth: formValue.dateOfBirth instanceof Date ? formValue.dateOfBirth.toISOString().split('T')[0] : formValue.dateOfBirth,
          email: formValue.email
        };

        console.log('Saving student:', student); // Debug log
        
        // Emit save event to parent
        this.studentSave.emit(student);
        
        // Reset form and close modal
        this.studentForm.reset();
        this.isLoading = false;
        this.modalClose.emit();
      }, 1000);
    }
  }

  /**
   * Handle delete confirmation
   */
  onConfirmDelete(): void {
    if (this.modalData?.student && !this.isLoading) {
      this.isLoading = true;
      
      // Simulate API call delay
      setTimeout(() => {
        this.studentDelete.emit(this.modalData!.student!.id);
        this.isLoading = false;
        this.modalClose.emit();
      }, 1000);
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}