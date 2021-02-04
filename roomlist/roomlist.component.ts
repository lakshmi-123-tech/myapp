import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import firebase from "firebase/app";
import "firebase/database";

export const snapshotToArray = (snapshot: any) => {
  const returnArr : any = [];

  snapshot.forEach((childSnapshot: any) => {
      const item = childSnapshot.val();
      item.key = childSnapshot.key;
      returnArr.push(item);
  });

  return returnArr;
};

@Component({
  selector: 'app-roomlist',
  templateUrl: './roomlist.component.html',
  styleUrls: ['./roomlist.component.css']
})
export class RoomlistComponent implements OnInit {
  nickname :any = '';
  displayedColumns: string[] = ['roomname'];
  rooms :any = [];
  isLoadingResults = true;
  constructor(private route: ActivatedRoute, private router: Router, ) { 
    this.nickname = localStorage.getItem('nickname');
    firebase.database().ref('rooms/').on('value', resp => {
      this.rooms = [];
      this.rooms = snapshotToArray(resp);
      this.isLoadingResults = false;
    });

  }

  ngOnInit(): void {
  
  }

   enterChatRoom(roomname: string) {
    const chat = { roomname: '', nickname: '', message: '',  type: '' };
    chat.roomname = roomname;
    chat.nickname = this.nickname;
    
    chat.message = `${this.nickname} enter the ${roomname}`;
    chat.type = 'join';
    const newMessage = firebase.database().ref('chats/').push();
    newMessage.set(chat);

    firebase.database().ref('roomusers/').orderByChild('roomname').equalTo(roomname).on('value', (resp: any) => {
      let roomuser : any[]= [];
      roomuser = snapshotToArray(resp);
      const user = roomuser.find((x : any) => x.nickname === this.nickname);
      if (user !== undefined) {
        const userRef = firebase.database().ref('roomusers/' + user.key);
        userRef.update({status: 'online'});
      } else {
        const newroomuser = { roomname: '', nickname: '', status: '' };
        newroomuser.roomname = roomname;
        newroomuser.nickname = this.nickname;
        newroomuser.status = 'online';
        const newRoomUser = firebase.database().ref('roomusers/').push();
        newRoomUser.set(newroomuser);
   
      }
      this.router.navigate(['/chatroom/:nickname', roomname]);
    });

  }
  logout(): void {
    localStorage.removeItem('nickname');
    this.router.navigate(['/login']);
  }
}
