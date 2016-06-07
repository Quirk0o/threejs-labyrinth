# Labyrinth game in Three.js

## Download deps

```bash
npm install
bower install
```

## Run and preview

Starts development server
```bash
npm start
```

## Build project
```bash
webpack
```

## Usage
Use W, S, A, D keys to walk around.

## Goal of the project

The goal of this project was to create a Three.js scene that would load 
a labyrinth schematic from a file and enable the user to walk around the created rooms

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

## Credits
Skybox images: http://www.custommapmakers.org/skyboxes.php
Player model and rig: https://www.youtube.com/watch?v=cGvalWG8HBU
