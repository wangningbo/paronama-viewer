function loadImages(imgs, callback) {
	if (!(imgs instanceof Array)) {
		imgs = [ imgs ];
	}
	var j = 0, l = imgs.length;
	function loaded() {
		if (++j == l) {
			callback();
		}
	}
	for (var i = 0; i < l; i++) {
		var img = new Image();
		img.onload = loaded;
		img.src = imgs[i];
	}
}
var supportWebgl = function() {
	var supported;
	return function() {
		if (typeof supported == 'undefined') {
			try {
				var canvas = document.createElement('canvas');
				supported = !!(window.WebGLRenderingContext && (canvas
						.getContext('webgl') || canvas
						.getContext('experimental-webgl')));
			} catch (e) {
				supported = false;
			}
		}
		return supported;
	}
}();
function css3dCube(images) {
	var camera, scene, renderer;
	var geometry, material, mesh;
	var target = new THREE.Vector3();
	var lon = 180, lat = 5;
	var phi = 0, theta = 0;
	var touchX, touchY;
	var zoomLevel = 0;

	init();
	animate();

	function init() {

		camera = new THREE.PerspectiveCamera(75, window.innerWidth
				/ window.innerHeight, 1, 1000);

		scene = new THREE.Scene();

		var sides = [ {
			url : images.right,
			position : [ -512, 0, 0 ],
			rotation : [ 0, Math.PI / 2, 0 ]
		}, {
			url : images.left,
			position : [ 512, 0, 0 ],
			rotation : [ 0, -Math.PI / 2, 0 ]
		}, {
			url : images.top,
			position : [ 0, 512, 0 ],
			rotation : [ Math.PI / 2, 0, Math.PI ]
		}, {
			url : images.bottom,
			position : [ 0, -512, 0 ],
			rotation : [ -Math.PI / 2, 0, Math.PI ]
		}, {
			url : images.front,
			position : [ 0, 0, 512 ],
			rotation : [ 0, Math.PI, 0 ]
		}, {
			url : images.back,
			position : [ 0, 0, -512 ],
			rotation : [ 0, 0, 0 ]
		} ];

		for (var i = 0; i < sides.length; i++) {

			var side = sides[i];

			var element = document.createElement('img');
			element.width = 1027; // 2 pixels extra to close the gap.
			element.src = side.url;

			var object = new THREE.CSS3DObject(element);
			object.position.fromArray(side.position);
			object.rotation.fromArray(side.rotation);
			scene.add(object);

		}

		renderer = new THREE.CSS3DRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		document.addEventListener('mousedown', onDocumentMouseDown, false);

		document.addEventListener('touchstart', onDocumentTouchStart, false);
		document.addEventListener('touchmove', onDocumentTouchMove, false);

		window.addEventListener('resize', onWindowResize, false);

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	function onDocumentMouseDown(event) {

		event.preventDefault();

		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mouseup', onDocumentMouseUp, false);

		// to help safari or machines missing mouse movements props
		touchX = event.x;
		touchY = event.y;

	}

	function onDocumentMouseMove(event) {
		var movementX = event.movementX || event.mozMovementX
				|| event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY
				|| event.webkitMovementY || 0;

		// Safari looks to be missing movementX
		// do similar to touch
		if (movementX == 0) {
			movementX = event.x - touchX;
			movementY = event.y - touchY;
		}

		lon -= movementX * 0.1;
		lat += movementY * 0.1;

		touchX = event.x;
		touchY = event.y;

	}

	function onDocumentMouseUp(event) {

		document.removeEventListener('mousemove', onDocumentMouseMove);
		document.removeEventListener('mouseup', onDocumentMouseUp);

	}

	function onDocumentMouseWheel(event) {

		// camera.fov -= event.wheelDeltaY * 0.05;
		// camera.updateProjectionMatrix();

	}

	function onDocumentTouchStart(event) {

		event.preventDefault();

		var touch = event.touches[0];

		touchX = touch.screenX;
		touchY = touch.screenY;

	}

	function onDocumentTouchMove(event) {

		event.preventDefault();

		var touch = event.touches[0];

		lon -= (touch.screenX - touchX) * 0.1;
		lat += (touch.screenY - touchY) * 0.1;

		touchX = touch.screenX;
		touchY = touch.screenY;

	}

	function animate() {

		requestAnimationFrame(animate);

		lon += 0.01;
		lat = Math.max(-85, Math.min(85, lat));
		phi = THREE.Math.degToRad(90 - lat);
		theta = THREE.Math.degToRad(lon);

		target.x = Math.sin(phi) * Math.cos(theta);
		target.y = Math.cos(phi);
		target.z = Math.sin(phi) * Math.sin(theta);

		camera.lookAt(target);

		renderer.render(scene, camera);

	}
}
function webglCube(img) {
	var camera, scene, renderer;

	var isUserInteracting = false, onMouseDownMouseX = 0, onMouseDownMouseY = 0, lon = 0, onMouseDownLon = 0, lat = 0, onMouseDownLat = 0, phi = 0, theta = 0;

	init();
	animate();

	function init() {

		var container, mesh;

		container = document.body;

		camera = new THREE.PerspectiveCamera(75, window.innerWidth
				/ window.innerHeight, 1, 1100);
		camera.target = new THREE.Vector3(0, 0, 0);

		scene = new THREE.Scene();

		var geometry = new THREE.SphereGeometry(500, 60, 40);
		geometry.scale(-1, 1, 1);

		var material = new THREE.MeshBasicMaterial({
			map : THREE.ImageUtils.loadTexture(img)
		});

		mesh = new THREE.Mesh(geometry, material);

		scene.add(mesh);

		renderer = new THREE.WebGLRenderer();
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

		document.addEventListener('mousedown', onDocumentMouseDown, false);
		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mousemove', onDocumentMouseMove, false);
		document.addEventListener('mouseup', onDocumentMouseUp, false);
		document.addEventListener('mousewheel', onDocumentMouseWheel, false);
		document.addEventListener('MozMousePixelScroll', onDocumentMouseWheel,
				false);
		document.addEventListener('touchstart', onDocumentTouchStart, false);
		document.addEventListener('touchmove', onDocumentTouchMove, false);

		//

		document.addEventListener('dragover', function(event) {

			event.preventDefault();
			event.dataTransfer.dropEffect = 'copy';

		}, false);

		document.addEventListener('dragenter', function(event) {

			document.body.style.opacity = 0.5;

		}, false);

		document.addEventListener('dragleave', function(event) {

			document.body.style.opacity = 1;

		}, false);

		document.addEventListener('drop', function(event) {

			event.preventDefault();

			var reader = new FileReader();
			reader.addEventListener('load', function(event) {

				material.map.image.src = event.target.result;
				material.map.needsUpdate = true;

			}, false);
			reader.readAsDataURL(event.dataTransfer.files[0]);

			document.body.style.opacity = 1;

		}, false);

		//

		window.addEventListener('resize', onWindowResize, false);

	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

	}

	function onDocumentMouseDown(event) {

		event.preventDefault();

		isUserInteracting = true;

		onPointerDownPointerX = event.clientX;
		onPointerDownPointerY = event.clientY;

		onPointerDownLon = lon;
		onPointerDownLat = lat;

	}

	function onDocumentMouseMove(event) {

		if (isUserInteracting === true) {

			lon = (onPointerDownPointerX - event.clientX) * 0.1
					+ onPointerDownLon;
			lat = (event.clientY - onPointerDownPointerY) * 0.1
					+ onPointerDownLat;

		}

	}
	function onDocumentTouchStart(event) {

		event.preventDefault();

		var touch = event.touches[0];

		onPointerDownPointerX = touch.screenX;
		onPointerDownPointerY = touch.screenY;

	}

	function onDocumentTouchMove(event) {

		event.preventDefault();

		var touch = event.touches[0];

		lon -= (touch.screenX - onPointerDownPointerX) * 0.1;
		lat += (touch.screenY - onPointerDownPointerY) * 0.1;

		onPointerDownPointerX = touch.screenX;
		onPointerDownPointerY = touch.screenY;

	}

	function onDocumentMouseUp(event) {

		isUserInteracting = false;

	}

	function onDocumentMouseWheel(event) {

		// WebKit

		if (event.wheelDeltaY) {

			camera.fov -= event.wheelDeltaY * 0.05;

			// Opera / Explorer 9

		} else if (event.wheelDelta) {

			camera.fov -= event.wheelDelta * 0.05;

			// Firefox

		} else if (event.detail) {

			camera.fov += event.detail * 1.0;

		}

		camera.updateProjectionMatrix();

	}

	function animate() {

		requestAnimationFrame(animate);
		update();

	}

	function update() {

		if (isUserInteracting === false) {

			lon += 0.01;

		}

		lat = Math.max(-85, Math.min(85, lat));
		phi = THREE.Math.degToRad(90 - lat);
		theta = THREE.Math.degToRad(lon);

		camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
		camera.target.y = 500 * Math.cos(phi);
		camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);

		camera.lookAt(camera.target);

		/*
		 * // distortion camera.position.copy( camera.target ).negate();
		 */

		renderer.render(scene, camera);

	}
}
function cube(images) {
	if (images.full && supportWebgl()) {
		loadImages(images.full, function() {
			try {
				webglCube(images.full);
			} catch (e) {
				//alert("webGL错误:" + e);
				loadImages([ images.left, images.right, images.front,
						images.back, images.top, images.bottom ], function() {
					css3dCube(images);
				});
			}
		});
	} else {
		loadImages([ images.left, images.right, images.front, images.back,
				images.top, images.bottom ], function() {
			css3dCube(images);
		})
	}
}