# Balatro - Editable Version

This is a runnable, editable version of Balatro extracted from the APK.

## Requirements

- **LÖVE2D** (Lua game framework)
  - Install: `brew install --cask love`
  - Or download from: https://love2d.org

## How to Run

### Option 1: Direct Run
```bash
love .
```

### Option 2: Create .love Package
```bash
zip -r balatro.love .
love balatro.love
```

### Option 3: Drag and Drop
Drag the `balatro_editable` folder onto the LÖVE application icon.

## File Structure

```
balatro_editable/
├── main.lua              # Main entry point
├── game.lua              # Core game logic (151 jokers defined here!)
├── card.lua              # Card system
├── blind.lua             # Boss blind mechanics
├── conf.lua              # Game configuration
├── globals.lua           # Global variables
├── engine/               # Game engine components
├── functions/            # Game functions
├── localization/         # Language files
└── resources/            # Assets
    ├── textures/         # Sprite sheets (including Jokers.png)
    ├── sounds/           # Audio files
    ├── shaders/          # Visual effects
    └── fonts/            # Typography
```

## How to Edit

### Modify Joker Cards
Edit `game.lua` starting at **line 371**. Each joker is defined like:

```lua
j_joker = {
    order = 1,
    unlocked = true,
    rarity = 1,
    cost = 2,
    name = "Joker",
    pos = {x=0, y=0},  -- Position in Jokers.png sprite sheet
    set = "Joker",
    effect = "Mult",
    config = {mult = 4}  -- Change this to modify effect!
}
```

**Try changing:**
- `config = {mult = 4}` → `config = {mult = 100}` (super powerful!)
- `cost = 2` → `cost = 1` (cheaper)
- `rarity = 1` → `rarity = 4` (make it legendary)

### Modify Game Settings
Edit `conf.lua`:
```lua
_RELEASE_MODE = false  -- Enable debug console
```

Edit `globals.lua` for starting values, colors, etc.

### Add Custom Jokers
1. Add a new entry in `game.lua` after line 529
2. Create/modify the sprite in `resources/textures/2x/Jokers.png`
3. Set the `pos` coordinates to your sprite location

## Tips for Modding

- **Backup first!** Copy this folder before making changes
- **Test incrementally** - Make small changes and test often
- **Check the console** - Errors will show in the terminal
- **Lua syntax** - Be careful with commas and brackets

## Common Edits

### Unlimited Money
In `game.lua`, find the starting money and change it:
```lua
-- Search for "starting_params" and modify dollars value
```

### Unlock All Jokers
In `game.lua` line 371-529, change all:
```lua
unlocked = false  →  unlocked = true
discovered = false  →  discovered = true
```

### Modify Hand Size
Edit the starting hand size in game configuration.

## Troubleshooting

**Game won't start?**
- Make sure LÖVE2D is installed
- Check for syntax errors in Lua files
- Run from terminal to see error messages

**Black screen?**
- Check that all resource files are present
- Verify `main.lua` and `conf.lua` are intact

**Crashes on startup?**
- Some Android-specific code may need commenting out
- Check the error message in terminal

## Educational Use Only

This is for learning game development and Lua programming. Do not distribute or use commercially.

---

**Happy Modding! 🃏**
