import { Component } from '@angular/core';
import {HomePage} from "../home/home";
import {RegisterPage} from "../register/register";

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  homePage = HomePage;
  registerPage = RegisterPage;
}
