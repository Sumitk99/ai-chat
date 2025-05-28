import {Component, OnInit} from '@angular/core';
import {MatFormField} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
@Component({
  selector: 'app-chat-box',
  imports: [
    MatFormField,
    FormsModule,
    MatInput,
    MatIconButton,
    MatIcon,

  ],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.scss'
})
export class ChatBoxComponent implements OnInit {
  message: string = '';
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) { }
  ngOnInit(): void {
    if( !this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      this.snackBar.open('Please login first', 'OK', {
        duration:3000,
      });
    }
  }
  onSend() {
    if (this.message.trim()) {
      // You can implement your own sending logic here
      console.log('Sending:', this.message);
      this.message = '';
    }
  }

}
