import { Injectable } from '@angular/core';

export interface Menu {
    state: string;
    name: string;
    type: string;
    icon: string;
    role?: string;
}

const MENUITEMS = [
    {state: 'dashboard', name: 'DASHBOARD', type: 'link', icon: 'dashboard', role: ''},
];

@Injectable()
export class MenuItems {
    getMenuItems(): Menu[] {
        return MENUITEMS;
    }
}