import { Component, OnInit } from "@angular/core";

import Phaser from "phaser";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.scss"],
})
export class GameComponent implements OnInit {
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor() {
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      // height: window.innerHeight,
      // width: window.innerWidth,
      scene: [MainScene],
      parent: "gameContainer",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 300 },
          debug: false,
        },
      },
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.config);
  }
}

enum GameMode {
  Normal,
  Alihan,
}

class MainScene extends Phaser.Scene {
  readonly assetsPath: string = "../../assets/";
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  player: Phaser.Physics.Arcade.Sprite;
  stars: Phaser.Physics.Arcade.Group;
  bombs: Phaser.Physics.Arcade.Group;
  score = 0;
  scoreText: Phaser.GameObjects.Text;
  alihanComplimentText: Phaser.GameObjects.Text;
  ComplimentAlihan: string[] = [
    "Alihana sert sert sokmalisin",
    "Bu hizla gidersen tüm alihanlara sokacaksin",
    "Alihana kac kere so  ktuguna bak!!!",
    "Bil bakalim Enver Alihana kac kez soktu?",
    "Herkes ister sen sokarsin Alihana",
  ];
  gameMode: GameMode = GameMode.Normal;
  addedImage: Phaser.GameObjects.Image;

  constructor() {
    super({ key: "main" });
  }

  preload() {
    this.load.image("sky", this.assetsPath + "sky.png");
    this.load.image("ground", this.assetsPath + "platform.png");
    this.load.image("star", this.assetsPath + "star.png");
    this.load.image("bomb", this.assetsPath + "bomb.png");
    this.load.image("alihan", this.assetsPath + "alihan.png");
    this.load.spritesheet("dude", this.assetsPath + "dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
    this.load.image("yiyenAlihan", this.assetsPath + "yiyenAlihan.jpeg");
    console.log("preload method");
  }

  create() {
    this.addedImage = this.add.image(400, 300, "sky");
    // this.add.image(400, 300, "alihan1");

    const platforms = this.physics.add.staticGroup();

    platforms.create(400, 568, "ground").setScale(2).refreshBody();
    platforms.create(600, 400, "ground");
    platforms.create(50, 250, "ground");
    platforms.create(690, 220, "ground");

    this.player = this.physics.add.sprite(100, 450, "dude");

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.player.setGravityY(300);

    this.physics.add.collider(this.player, platforms);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate((child: Phaser.Physics.Arcade.Sprite) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      child.setCollideWorldBounds(true);
    });

    this.physics.add.collider(platforms, this.stars);

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fontWeight: "bold",
      fill: "#000",
    });

    this.bombs = this.physics.add.group();

    this.physics.add.collider(this.bombs, platforms);
    this.physics.add.collider(
      this.player,
      this.bombs,
      this.hitBomb,
      null,
      this
    );
  }

  collectStar(player, star: Phaser.Physics.Arcade.Sprite) {
    star.disableBody(true, true);

    this.score += 10;
    this.scoreText.setText(
      this.gameMode === GameMode.Alihan
        ? "Alihana " + this.score + " kere soktun"
        : "Score: " + this.score
    );
    console.log(this.gameMode);

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child: Phaser.Physics.Arcade.Sprite) => {
        child.enableBody(true, child.x, 0, true, true);
      });

      const x =
        player.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);

      this.bombs.create(x, 16, "bomb");
      this.bombs.create(x, 16, "bomb");
      this.bombs.children.iterate((bomb: any) => {
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        console.log("child: ", bomb);
      });
    }

    if (this.gameMode === GameMode.Alihan) {
      if (this.alihanComplimentText) this.alihanComplimentText.destroy();
      this.alihanComplimentText = this.add.text(
        this.player.x,
        this.player.y,
        this.ComplimentAlihan[
          Phaser.Math.Between(0, this.ComplimentAlihan.length - 1)
        ],
        {
          font: "bold 30px Arial",
          fontSize: "24px",
          fontWeight: "bold",
          align: "center",
          wordWrap: { width: 350, useAdvancedWrap: true },
          // fill: "#000",
        }
      );
    }
  }

  hitBomb(
    player: Phaser.Physics.Arcade.Sprite,
    bomb: Phaser.Physics.Arcade.Sprite
  ) {
    if (this.gameMode === GameMode.Alihan) {
      this.add.image(500, 500, "yiyenAlihan");
    }

    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play("turn");
    setTimeout(() => {
      alert("Game Over");
      window.location.reload();
    }, 1000);
  }

  update() {
    if (
      this.cursors.shift.isDown &&
      this.cursors.space.isDown &&
      this.gameMode != GameMode.Alihan
    ) {
      this.stars.children.iterate((child: Phaser.Physics.Arcade.Sprite) => {
        child.setTexture("alihan");
      });
      this.scoreText.setText("Alihana sokmaya baslaa");
      this.gameMode = GameMode.Alihan;
    }
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-450);
    }
  }
}
