# Labyrinth game in Three.js

## Running the project

```bash
npm install
bower install
```

Starts development server
```bash
npm start
```

Builds project into `dist` directory
```bash
webpack
```

## Usage
Use `W`, `S`, `A`, `D` keys to walk around.

## Important files
The entry point for the project is the file `src/index.js` which initializes and renders the scene as well as starting the animation.

An important file is located in `src/components/Map/Map.js` - it contains the logic for parsing the heightmap file into wall objects for the labyrinth.

## Goal of the project

The goal of this project was to create a Three.js scene that would load 
a labyrinth schematic from a file and enable the user to walk around the created rooms

Currently the scene is being loaded from a static file you can find in `src/textures/heightmap.png`

## Implemented functionality

* Loading labyrinth from file
* Parsing images into pixel data
* Creating labyrinth layout
* Player model with walking animation
* Player controls and chase camera
* Collisions of the player model with walls
* Textured walls and floor
* Skybox

I created the walking animation using Blender and exported the model and animation
 with a Blender addon into json format.

The collision are implemented using Physijs.

Other libraries used are THREE.js` OrbitControls, WindowResize, KeyboardState.

## Summary

More functionality was planned for this project, unfortunately THREE.js library's poor documentation and small community as well as the small number of working examples caused many problems and frequent inability to find the reason for the scene not looking or working the way it should. 

The main blocker was implementing collisions - Physijs documentation is practically nonexistent. As it happened I was grouping the walls of the labyrinth in a THREE.js object and Physijs only considered collisions on Physijs objects that were direct descendants from the Physijs scene.

Another problem was created by the loaders for external models. After trying many loaders that were available for more common formats like Collada and OBJ and getting very poor results (transparent models, no animation etc.) I finally installed an addon for Blender to export the project into json. Which didn't work out of the box either and I was forced to downgrade the addon to a version from last year in order to get it to work.

## Credits

* Skybox images: http://www.custommapmakers.org/skyboxes.php
* Player model and rig: https://www.youtube.com/watch?v=cGvalWG8HBU
