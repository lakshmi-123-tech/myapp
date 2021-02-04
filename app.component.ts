import { OnInit } from '@angular/core';
import { Component } from '@angular/core';

import firebase from "firebase/app";

const config = {
  apiKey: 'AIzaSyA53HhWDJQTgPkf9VI1P0BjuNG8_bXUJBY',
  databaseURL: 'https://chatapp-97a66-default-rtdb.firebaseio.com'
};


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'myapp';
  constructor() { 
    firebase.initializeApp(config);
  }

  ngOnInit(): void {
  }
  
  }


