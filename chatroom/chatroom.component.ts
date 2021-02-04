import { Component, OnInit } from '@angular/core';
import firebase from "firebase/app";
import "firebase/database";
import { ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';


export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export const snapshotToArray = (snapshot: any) => {
  const returnArr:any = [];

  snapshot.forEach((childSnapshot: any) => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
  });

  return returnArr;
};
@Component({
  selector: 'app-chatroom',
  templateUrl: './chatroom.component.html',
  styleUrls: ['./chatroom.component.css']
})
export class ChatroomComponent implements OnInit {
  @ViewChild('chatcontent') chatcontent: ElementRef;
  scrolltop: any = null;

  chatForm: FormGroup;
  nickname : any = '';
  roomname : any= '';
  message : any = '';
  users:any = [];
  chats:any= [];
  matcher = new MyErrorStateMatcher();
  constructor(private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,

   ) {
      this.nickname = localStorage.getItem('nickname') ;
      this.roomname = this.route.snapshot.params.roomname;
      firebase.database().ref('chats/').on('value', resp => {
        this.chats = [];
        this.chats = snapshotToArray(resp);
        setTimeout(() => this.scrolltop = this.chatcontent.nativeElement.scrollHeight, 500);
      });
      firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(this.roomname).on('value', (resp2: any) => {
        const roomusers = snapshotToArray(resp2);
        this.users = roomusers.filter((x:any) => x.status === 'online');
      });

     }

  ngOnInit(): void {
    this.chatForm = this.formBuilder.group({
      'message' : [null, Validators.required]
    }); }

    onFormSubmit(form: any) {
      const chat = form;
      chat.roomname = this.roomname;
      chat.nickname = this.nickname;
      
      chat.type = 'message';
      const newMessage = firebase.database().ref('chats/').push();
      newMessage.set(chat);
      this.chatForm = this.formBuilder.group({
        'message' : [null, Validators.required]
      });
    }

    exitChat() {
      const chat = { roomname: '', nickname: '', message: '',   type: '' };
      chat.roomname = this.roomname;
      chat.nickname = this.nickname;
      
      chat.message = `${this.nickname} left the  ${this.roomname}`;
      chat.type = 'exit';
      const newMessage = firebase.database().ref('chats/').push();
      newMessage.set(chat);
  
      firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(this.roomname).on('value', (resp: any) => {
        let roomuser : any = [];
        roomuser = snapshotToArray(resp);
        const user = roomuser.find((x:any) => x.nickname === this.nickname);
        if (user !== undefined) {
          const userRef = firebase.database().ref('roomusers/' + user.key);
          userRef.update({status: 'offline'});
        }
      });
  
      this.router.navigate(['/roomlist/:nickname']);
    }

}
