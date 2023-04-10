let draggbles = document.querySelectorAll('.course-draggable');
let containers = document.querySelectorAll('.projects__courses-group');
let containersWrapper = document.querySelector('.projects__content');
let createdNewContainer = false;
let dragParent = null;
let dropZone = document.body;

function makeDropZone(el) {
	el.addEventListener('dragover', handleDragover);
}
makeDropZone(dropZone);

function handleDragover(ev) {
	ev.preventDefault();
}

function updateContainers() {
	containers = document.querySelectorAll('.projects__courses-group');
	containers.forEach((container) => {
		container.addEventListener('dragover', function (e) {
			e.preventDefault();
			const afterElement = dragAfterElement(container, e.clientY);
			const dragging = document.querySelector('.dragging');
			if (afterElement == null) {
				container.appendChild(dragging);
			} else {
				// the ability to insert an group before another
				container.insertBefore(dragging, afterElement);
			}
		});
	});
}
updateContainers();

function updateClasses(draggble) {
	if (draggble.parentNode.querySelectorAll('.course-draggable').length > 1) {
		draggble.parentNode.classList.toggle('open-group');
		draggble.parentNode.parentNode.classList.toggle('open-group');
	} else if (draggble.parentNode.querySelectorAll('.course-draggable').length <= 1) {
		draggble.parentNode.classList.remove('open-group');
		draggble.parentNode.parentNode.classList.remove('open-group');
	}
}

// click on draggble item
draggbles.forEach((draggble) => {
	draggble.addEventListener('click', () => {
		updateClasses(draggble);
		Array.prototype.slice.call(document.querySelectorAll('.projects__courses-group')).some((element) => {
			if (element.classList.contains('open-group')) {
				if (!element.parentNode.classList.contains('open-group')) {
					element.parentNode.classList.add('open-group');
				}
			}
		});
	});

	// dragstart
	draggble.addEventListener('dragstart', (e) => {
		// record the dragged element's parent
		dragParent = e.target.parentElement.parentElement;

		// set a 'drop' listener to the window
		window.addEventListener('drop', handleDrop);
		draggble.classList.add('dragging');
		createdNewContainer = false;
		containers.forEach((container) => {
			container.removeEventListener('dragover', () => {
				return false;
			});
		});
	});

	// dragend
	draggble.addEventListener('dragend', (e) => {
		draggble.classList.remove('dragging');
		draggble.parentNode.classList.remove('created');
		let query = Array.prototype.slice.call(document.querySelectorAll('.projects__courses-group'));
		// update classes
		let checkClasses = query.every((container) => {
			if (container.querySelectorAll('.course-draggable').length == 0) {
				// remove empty container
				container.remove();
			} else if (container.querySelectorAll('.course-draggable').length == 1) {
				// remove group classes
				container.classList.remove('open-group');
				container.classList.remove('active-group');
			} else if (container.querySelectorAll('.course-draggable').length >= 2) {
				// add group classes
				container.classList.add('active-group');
			} else {
				draggble.parentNode.parentNode.classList.remove('open-group');
				container.classList.remove('active-group');
			}

			return container;
		});
		// the last element left the group
		query.some((container) => {
			if (container.parentNode) {
				if (!container.classList.contains('active-group')) {
					container.parentNode.classList.remove('open-group');
				}
			}
			return container;
		});
	});
});
//shit

containersWrapper.addEventListener('dragover', function (e) {
	// created new container if dragover
	if (!createdNewContainer) {
		let _container = document.createElement('div');
		_container.classList.add('projects__courses-group', 'created');
		document.querySelector('.projects__courses').appendChild(_container);
		updateContainers();
		createdNewContainer = true;
	}
});

function handleDrop(ev) {
	ev.preventDefault();
	// remove the 'drop' listener
	window.removeEventListener('drop', handleDrop);
	// search up target's DOM tree for dragParent
	for (let el = ev.target; el.tagName !== 'HTML'; el = el.parentElement) {
		if (el === dragParent) {
			//was dropped inside dragParent
			return;
		}
	}
	updateContainers();
	//item was dropped outside dragParent
	containers.forEach((container) => {
		const dragging = document.querySelector('.dragging');
		container.appendChild(dragging);
	});
}

function dragAfterElement(container, y) {
	const draggbleElements = [...container.querySelectorAll('.course-draggable:not(.dragging)')];

	return draggbleElements.reduce(
		(closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;
			if (offset < 0 && offset > closest.offset) {
				return { offset: offset, element: child };
			} else {
				return closest;
			}
		},
		{ offset: Number.NEGATIVE_INFINITY }
	).element;
}
