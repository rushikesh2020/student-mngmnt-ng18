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

 isLoading: boolean = false;
  transactionForm!: FormGroup;
  disableSubmit: boolean = false;
  Small_Figure_Decimal: number;

  counterParties!: any;
  filteredParties!: string[];

  constructor(
    private tranService: TransactionsService,
    private accordionService: AccordionControlService,
    private fb: FormBuilder,
    private permissionService: KhataPermissionsService,
    private globalService: GlobalService
  ) {}

  ngOnInit(): void {
    if (
      this.permissionService.isInterbankDealer() ||
      this.permissionService.isMerchantDealer()
    ) {
      this.initializeForm();
      this.transactionForm.disable();
      this.disableSubmit = true;
    } else {
      this.initializeForm();
      this.setupFieldDisabling();
      this.setupCounterPartyAutoComplete();

      this.globalService
        .getKhatabookParameters("Small_Figure_Decimal")
        .subscribe({
          next: (res) => {
            console.log(res);
            this.Small_Figure_Decimal = +res["alldata"][0];
          },
        });
    }
  }

  private setupCounterPartyAutoComplete() {
    this.tranService.getCounterPartyData().subscribe({
      next: (res) => {
        console.log("counterParties", res, res.result);
        const data = res.result;
        this.counterParties = data;
      },
      error: (err) => {
        console.log("Error while getting counter party data", err);
      },
    });
    this.counterPartyControl?.valueChanges.subscribe({
      next: (value) => {
        this.filteredParties = this.filterCounterParties(value || "");
        // console.log(this.filteredParties);
      },
    });
  }

  private filterCounterParties(value: string) {
    const filterValue = value.toLowerCase();
    const filteredParties: string[] = [];
    for (let party of this.counterParties) {
      if (
        party.code.toLowerCase().includes(filterValue) ||
        party.name.toLowerCase().includes(filterValue)
      ) {
        // console.log(`${party.code} (${party.name})`);
        filteredParties.push(`${party.code} (${party.name})`);
      }
      // console.log(party.name, party.code);
    }
    // console.log(filteredParties);
    return filteredParties;
  }

  private initializeForm(): void {
    this.transactionForm = this.fb.group({
      buyAmount: [
        "",
        [
          Validators.required,
          CustomFormValidators.allowedCharsValidator(),
          CustomFormValidators.nonZeroValue(),
        ],
      ],
      sellAmount: [
        "",
        [
          Validators.required,
          CustomFormValidators.allowedCharsValidator(),
          CustomFormValidators.nonZeroValue(),
        ],
      ],
      bigFigure: [
        "",
        [Validators.required, CustomFormValidators.numericRange(1, 999)],
      ],
      smallFigure: [
        "",
        [Validators.required, CustomFormValidators.numericRange(0, 9999)],
      ],
      counterParty: [""],
      dealer: ["", [Validators.required]],
    });
  }

  private setupFieldDisabling(): void {
    this.buyAmountControl?.valueChanges.subscribe((buyValue) => {
      if (buyValue) {
        this.sellAmountControl?.disable({ emitEvent: false });
      } else {
        this.sellAmountControl?.enable({ emitEvent: false });
      }
    });

    this.sellAmountControl?.valueChanges.subscribe((sellValue) => {
      if (sellValue) {
        this.buyAmountControl?.disable({ emitEvent: false });
      } else {
        this.buyAmountControl?.enable({ emitEvent: false });
      }
    });
  }

  // Allow digits (0-9)
  onlyNumberKey(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);

    if (charCode >= 48 && charCode <= 57) {
      return true;
    }

    if (
      [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "Tab",
        "Home",
        "End",
      ].includes(event.key) ||
      (event.ctrlKey && event.key === "a") ||
      (event.shiftKey && event.key === "Home")
    ) {
      return true;
    }

    return false;
  }

  addTransaction(): void {
    this.isLoading = true;
    if (this.transactionForm.valid) {
      let newTransaction = {
        ...this.transactionForm.value,
        buyAmount: this.buyAmountControl.value?.replace(/,/g, "") || null,
        sellAmount: this.sellAmountControl.value?.replace(/,/g, "") || null,
      };
      this.tranService.addTransaction(newTransaction).subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log("Response on txn addition", res);
          Swal.fire({
            icon: "success",
            text: "Transaction added successfully",
            timer: 2000,
          });
          // this.accordionService.openPanel("transactions");
          // (document.activeElement as HTMLElement)?.blur();
          // this.transactionForm.reset({
          //   bigFigure: this.bigFigureControl.value,
          // });
          // formDirective.resetForm({
          //   bigFigure: this.bigFigureControl.value,
          // });

          // const savedBigFigure = this.transactionForm.get("bigFigure")?.value;
          this.transactionForm.reset();
          // this.transactionForm.patchValue({
          //   bigFigure: savedBigFigure,
          // });
        },
        error: (err) => {
          this.isLoading = false;
          console.error("Error adding Txn: ", err);
          Swal.fire({
            icon: "error",
            text: "Error while adding Transaction",
            timer: 2000,
          });
        },
      });
    } else {
      this.isLoading = false;
      this.transactionForm.markAllAsTouched();
      Swal.fire({ icon: "warning", text: "Invalid form", timer: 2000 });
    }
  }

  // Getters for easy access to form controls in template
  get buyAmountControl() {
    return this.transactionForm.get("buyAmount");
  }

  get sellAmountControl() {
    return this.transactionForm.get("sellAmount");
  }

  get bigFigureControl() {
    return this.transactionForm.get("bigFigure");
  }

  get smallFigureControl() {
    return this.transactionForm.get("smallFigure");
  }

  get counterPartyControl() {
    return this.transactionForm.get("counterParty");
  }

  get dealerControl() {
    return this.transactionForm.get("dealer");
  }
}
