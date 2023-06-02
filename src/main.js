import Phaser from "phaser";

import FlappyTinybirdScene from "./scenes/FlappyTinybirdScene";
import MainMenuScene from "./scenes/MainMenuScene";
import EndGameScene from "./scenes/EndGameScene";

/** @type {import('phaser').Types.Core.GameConfig} */
const config = {
    type: Phaser.AUTO,
    parent: "app",
    width: 400,
    height: 560,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 1000 },
            debug: import.meta.env.DEV,
        },
    },
    dom: {
        createContainer: true
    },
    backgroundColor: "rgba(113, 197, 207,0)",
    scene: [MainMenuScene, EndGameScene, FlappyTinybirdScene],
};

export default new Phaser.Game(config);
