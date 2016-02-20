/*

This contains all of the constants used in the game

*/


const width = 800;
const height = 600;

const gameWidth = 2400;
const gameHeight = 1800;

// player
const playerRadius = 20;
const playerGunSize = 10;
const playerJump = -300;
const playerAcceleration = 400;
const maxPlayerSpeed = 450; // IDK WHAT THIS SHOULD BE
const shootRate = 400;
const friction = 70;

// bullet
const bulletSpeed = 600;

const fps = 1000 / 60; // 60 is the real fps

const keyCodes = {
  space: 32,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  w: 87,
  a: 65,
  s: 83,
  d: 68
};

// just returns a negative half the time
var returnNeg = function(num) {
  if(Math.random()*100 < 50) {
    return -num;
  }
  return num;
}