import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/service/auth.service';

@Component({
  selector: 'app-auth-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  signUpForm2!: UntypedFormGroup;
  formSubmitted: boolean = false;
  loading: boolean = false;
  error: string = '';

  constructor (
    private fb: UntypedFormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,
  ) { }

  ngOnInit(): void {
    this.signUpForm2 = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  /**
   * convenience getter for easy access to form fields
   */
  get formValues() {
    return this.signUpForm2.controls;
  }


  /**
   * On form submit
   */
  onSubmit(): void {
    this.formSubmitted = true;
    if (this.signUpForm2.valid) {
      this.loading = true;
      this.authenticationService.signup(this.formValues.name?.value, this.formValues.email?.value, this.formValues.password?.value)
        .pipe(first())
        .subscribe(
          (data: any) => {
            // navigates to confirm mail screen
            this.router.navigate(['/auth/confirm2']);
          },
          (error: any) => {
            this.error = error;
            this.loading = false;
          });
    }
  }

}
