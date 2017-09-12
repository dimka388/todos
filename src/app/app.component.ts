import { Component, Input } from '@angular/core';
import { Injectable }     from '@angular/core';
import { NgForm } from '@angular/forms';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Injectable()

@Component({
	selector: 'app-root',
	moduleId: module.id,
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss']
})

export class AppComponent {
	src = 'https://59b68e8ed7d6800011e572f5.mockapi.io/items';
	items = [];

	getItems(): Observable <any> {
		return this.http.get(this.src)
			.map((res:any) => res.json());
	}

	itemRemove(obj) {
		this.items = this.items.filter(item => item !== obj);
		this.http.delete(this.src + '/' + obj.id)
			.subscribe(() => console.warn('Item removed:' + obj.value));
	}

	onChangeStatus(e, obj) {
		this.items.map((item) => {
			if (item.id === obj.id) {
				item.complete = e.target.checked;
				this.http.put(this.src + '/' + item.id, item)
					.subscribe(() => console.warn('Item updated:' + item.value));
			}
		});
	}

	onSubmit(itemForm: NgForm, event: Event) {
		event.preventDefault();
		const newItem = {
			id: this.items.length + 1,
			value: itemForm.value.text,
			priority: itemForm.value.priority || 'normal',
			index: this.items.length + 1
		};
		this.items.push(newItem);
		this.http.post(this.src, newItem)
			.subscribe(() => console.warn('Item added:' + newItem.value));
		itemForm.reset();
	}

	constructor(private http:Http) {
		this.getItems().subscribe(data => {
			data.sort((a, b) => {
				return +a.index > +b.index;
			});
			this.items = data;
		});
	}
}
