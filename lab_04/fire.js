const Fire = function(ctx, x, y) {

    // This is the sprite sequences of the gem of four colours
    // `green`, `red`, `yellow` and `purple`.
    const sequences = { x: 0, y: 160, width: 16, height: 16, count: 8, timing: 200, loop: true };

    // This is the sprite object of the gem created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the gem sprite here.
    sprite.setSequence(sequences)
    .setScale(2)
    .setShadowScale({ x: 0.75, y: 0.2 })
    .useSheet("object_sprites.png");

    return{
        update: sprite.update,
        draw: sprite.draw
    }
}