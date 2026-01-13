import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/service/auth.service';
import { User } from 'src/app/core/models/auth.models';
import { BreadcrumbItem } from 'src/app/shared/page-title/page-title.model';

@Component({
  selector: 'app-account-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  pageTitle: BreadcrumbItem[] = [];
  profileForm!: UntypedFormGroup;
  passwordForm!: UntypedFormGroup;
  formSubmitted: boolean = false;
  passwordFormSubmitted: boolean = false;
  loading: boolean = false;
  passwordLoading: boolean = false;
  error: string = '';
  passwordError: string = '';
  success: string = '';
  passwordSuccess: string = '';
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private fb: UntypedFormBuilder
  ) { }

  ngOnInit(): void {
    // Configure breadcrumb
    this.pageTitle = [
      { label: 'Apps', path: '/apps' },
      { label: 'Minha Conta', path: '/apps/account/profile', active: true }
    ];

    this.currentUser = this.authenticationService.currentUser();
    
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Initialize profile form
    this.profileForm = this.fb.group({
      firstName: [this.currentUser.firstName || '', [Validators.required]],
      lastName: [this.currentUser.lastName || '', [Validators.required]],
      email: [this.currentUser.email || '', [Validators.required, Validators.email]],
      phone: [this.currentUser.phone || '', []],
      location: [this.currentUser.location || '', []],
      title: [this.currentUser.title || '', []]
    });

    // Initialize password form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * convenience getter for easy access to form fields
   */
  get profileFormValues() { return this.profileForm.controls; }
  get passwordFormValues() { return this.passwordForm.controls; }

  /**
   * Custom validator to check if passwords match
   */
  passwordMatchValidator(form: UntypedFormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword && confirmPassword && newPassword === confirmPassword 
      ? null 
      : { passwordMismatch: true };
  }

  /**
   * On submit profile form
   */
  onSubmitProfile(): void {
    this.formSubmitted = true;
    this.error = '';
    this.success = '';

    if (this.profileForm.valid) {
      this.loading = true;
      const profileData = {
        firstName: this.profileFormValues.firstName?.value,
        lastName: this.profileFormValues.lastName?.value,
        email: this.profileFormValues.email?.value,
        phone: this.profileFormValues.phone?.value,
        location: this.profileFormValues.location?.value,
        title: this.profileFormValues.title?.value
      };

      this.authenticationService.updateProfile(profileData)
        .pipe(first())
        .subscribe(
          (data: any) => {
            this.loading = false;
            this.success = 'Perfil atualizado com sucesso!';
            this.currentUser = this.authenticationService.currentUser();
            setTimeout(() => {
              this.success = '';
            }, 3000);
          },
          (error: any) => {
            this.error = error || 'Erro ao atualizar perfil';
            this.loading = false;
          });
    }
  }

  /**
   * On submit password form
   */
  onSubmitPassword(): void {
    this.passwordFormSubmitted = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    if (this.passwordForm.valid) {
      this.passwordLoading = true;
      const currentPassword = this.passwordFormValues.currentPassword?.value;
      const newPassword = this.passwordFormValues.newPassword?.value;

      this.authenticationService.changePassword(currentPassword, newPassword)
        .pipe(first())
        .subscribe(
          (data: any) => {
            this.passwordLoading = false;
            this.passwordSuccess = 'Senha alterada com sucesso!';
            this.passwordForm.reset();
            this.passwordFormSubmitted = false;
            setTimeout(() => {
              this.passwordSuccess = '';
            }, 3000);
          },
          (error: any) => {
            this.passwordError = error || 'Erro ao alterar senha';
            this.passwordLoading = false;
          });
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.authenticationService.logout();
    this.router.navigate(['/auth/login']);
  }
}

