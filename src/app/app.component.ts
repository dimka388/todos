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
	priorityList = ['low', 'medium', 'high'];
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

	itemDone(obj) {
		this.items.map((item) => {
			if (item.id === obj.id) {
				item.complete = !item.complete;
				this.http.put(this.src + '/' + item.id, item)
					.subscribe(() => console.warn('Item updated:' + item.value));
			}
		});
	}

	itemPriorityChange(e, obj) {
		this.items.map((item) => {
			if (item.id === obj.id) {
				item.priority = e.target.value;
				this.http.put(this.src + '/' + item.id, item)
					.subscribe(() => console.warn('Item updated:' + item.value));
			}
		});
	}

	itemOrderChange(currentItem, otherItems, decrement) {
		let newIndex = null;
		let updatedItems = [];
		let getIndex = (index) => {
			if (decrement) {
				return newIndex === null || index >= newIndex;
			} else {
				return newIndex === null || newIndex > index;
			}
		}
		if (otherItems.length) {
			if (decrement) {
				otherItems.sort((a: any, b: any) => b.index - a.index);
			}
			otherItems.map(item => {
				if (getIndex(item.index)) {
					newIndex = item.index;
					item.index = currentItem.index;
					updatedItems.push(item);
				}
			});
			currentItem.index = newIndex;
			updatedItems.push(currentItem);
			this.onChangeOrder(updatedItems);
		}
	}

	itemUp(currentItem) {
		this.itemOrderChange(currentItem, this.items.filter(item => item.index < currentItem.index), true);
	}
	
	itemDown(currentItem) {
		this.itemOrderChange(currentItem, this.items.filter(item => item.index > currentItem.index), false);
	}

	onChangeOrder(items: any) {
		items.map(item => {
			this.http.put(this.src + '/' + item.id, item)
			.subscribe(() => console.warn('Item updated:' + item.value));
		});
		this.items.sort((a: any, b: any) => {
			return a.index - b.index;
		});
	}

	onSubmit(itemForm: NgForm, event: Event) {
		event.preventDefault();
		const newItem = {
			id: this.items.length + 1,
			value: itemForm.value.text,
			priority: itemForm.value.priority || this.priorityList[0],
			index: this.items.length + 1
		};
		if (!itemForm.value.text.length) {
			return;
		}
		this.items.push(newItem);
		this.http.post(this.src, newItem)
			.subscribe(() => console.warn('Item added:' + newItem.value));
		itemForm.reset();
	}

	constructor(private http:Http) {
		this.getItems().subscribe(data => {
			data.sort((a: any, b: any) => {
				return a.index - b.index;
			});
			this.items = data;
		});
	}
}
