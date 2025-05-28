import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import {NgIf} from '@angular/common';
import {MatCard, MatCardContent} from '@angular/material/card';
// import {environment} from "../../environments/environment";
import { MatFormField} from '@angular/material/form-field';
import { MatLabel} from '@angular/material/form-field';
import { MatError} from '@angular/material/form-field';
import { MatIcon}  from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';

interface LoginResponse {
  account: {
    id: string;
    name: string;
    email: string;
    phone: string;
    userType: string;
  };
  JWT_Token: string;
  Refresh_Token: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    NgIf,
    MatCardContent,
    MatCard,
    MatFormField,
    MatError,
    MatIcon,
    MatIconButton,
    MatInput,
    MatButton,
    HttpClientModule,
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  hidePassword = true;
  domain: string = 'https://micro-scale.software/api'

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['alice.smith123@example.com', [Validators.required, Validators.email]],
      password: ['newsecurepass123', [Validators.required, Validators.minLength(6)]]
    });
  }


  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = null;

    const loginData = {
      email: this.loginForm.get('email')?.value,
      password: this.loginForm.get('password')?.value
    };

    this.http.post<LoginResponse>(`${this.domain}/login`, loginData).subscribe({
      next: (response) => {
        this.authService.login(response.JWT_Token, response.Refresh_Token, response.account);
        this.loading = false;
        // this.router.navigate(['/']);
      },
      error: (err) => {
        this.error = err.error?.message || 'Login failed. Please check your credentials.';
        this.loading = false;
        console.error('Login error:', err);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
