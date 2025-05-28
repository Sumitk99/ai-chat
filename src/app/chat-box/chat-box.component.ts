import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked
} from '@angular/core';
import {MatFormField} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {MatInput} from '@angular/material/input';
import {MatIconButton} from '@angular/material/button';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HttpClientModule} from '@angular/common/http';
import {HttpClient} from '@angular/common/http';
import {NgClass, NgForOf} from '@angular/common';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chat-box',
  imports: [
    MatFormField,
    FormsModule,
    MatInput,
    MatIconButton,
    MatIcon,
    HttpClientModule,
    NgClass,
    NgForOf,

  ],
  templateUrl: './chat-box.component.html',
  styleUrl: './chat-box.component.scss'
})
export class ChatBoxComponent implements OnInit {
  message: string = '';
  aiName: string = '';
  domain: string = 'http://localhost:8000';
  chatMessages: ChatMessage[] = [];
  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      this.snackBar.open('Please login first', 'OK', { duration: 3000 });
    }

    this.http.get<any>(`${this.domain}/v1/models`).subscribe({
      next: (res) => {
        this.aiName = res?.data?.[0]?.id ?? 'Unknown AI';
        console.log(res);
      },
      error: () => {
        this.aiName = 'Select Model';
      }
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  scrollToBottom() {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  onSend() {
    const trimmed = this.message.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    this.chatMessages.push(userMessage);

    this.message = '';

    const body = {
      model: this.aiName,
      messages: [{ role: 'user', content: trimmed }],
      stream: true
    };

    fetch(`${this.domain}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': this.authService.getToken() ?? ''
      },
      body: JSON.stringify(body)
    }).then(async (response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      let assistantContent = '';
      const assistantMessage: ChatMessage = { role: 'assistant', content: '' };
      this.chatMessages.push(assistantMessage);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk
          .split('\n')
          .filter((line) => line.trim() !== '' && line.startsWith('data: '));

        for (const line of lines) {
          const data = line.replace('data: ', '').trim();
          if (data === '[DONE]') return;

          try {
            const json = JSON.parse(data);
            const delta = json?.choices?.[0]?.delta;

            if (delta?.content) {
              assistantContent += delta.content;
              assistantMessage.content = assistantContent;
            }
          } catch (e) {
            console.error('Error parsing stream chunk', e);
          }
        }
      }
    });
  }

}
