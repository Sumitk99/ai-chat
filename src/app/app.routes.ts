import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  { path: 'chat', component: ChatBoxComponent },
];
