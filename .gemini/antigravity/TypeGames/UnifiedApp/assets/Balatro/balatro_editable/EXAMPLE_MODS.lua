-- BALATRO MOD: Super Powered Jokers
-- This file contains example modifications you can make to the game
-- Copy these changes into game.lua to activate them

-- ============================================
-- EXAMPLE 1: Make the basic Joker super powerful
-- ============================================
-- Find line 371 in game.lua and change:
--
-- FROM:
--   j_joker = {order = 1, unlocked = true, start_alerted = true, discovered = true, start_discovered = true, blueprint_compat = true, perishable_compat = true, eternal_compat = true, rarity = 1, cost = 2, name = "Joker", pos = {x=0,y=0}, set = "Joker", effect = "Mult", cost_mult = 1.0, config = {mult = 4}},
--
-- TO:
--   j_joker = {order = 1, unlocked = true, start_alerted = true, discovered = true, start_discovered = true, blueprint_compat = true, perishable_compat = true, eternal_compat = true, rarity = 4, cost = 1, name = "MEGA Joker", pos = {x=0,y=0}, set = "Joker", effect = "Mult", cost_mult = 1.0, config = {mult = 500}},
--
-- Changes:
-- - mult = 4 → mult = 500 (gives +500 mult instead of +4!)
-- - cost = 2 → cost = 1 (cheaper)
-- - rarity = 1 → rarity = 4 (legendary rarity)
-- - name = "Joker" → name = "MEGA Joker"


-- ============================================
-- EXAMPLE 2: Unlock all jokers at start
-- ============================================
-- Use find and replace in game.lua:
-- Find: unlocked = false
-- Replace: unlocked = true
--
-- Find: discovered = false
-- Replace: discovered = true


-- ============================================
-- EXAMPLE 3: Make Greedy Joker insanely powerful
-- ============================================
-- Find line 372 in game.lua and change:
--
-- FROM:
--   j_greedy_joker = {order = 2, unlocked = true, demo = false, discovered = false, blueprint_compat = true, perishable_compat = true, eternal_compat = true, rarity = 1, cost = 5, name = "Greedy Joker", pos = {x=6,y=1}, set = "Joker", effect = "Suit Mult", cost_mult = 1.0, config = {extra = {s_mult = 3, suit = 'Diamonds'}}},
--
-- TO:
--   j_greedy_joker = {order = 2, unlocked = true, demo = false, discovered = true, blueprint_compat = true, perishable_compat = true, eternal_compat = true, rarity = 1, cost = 1, name = "Greedy Joker", pos = {x=6,y=1}, set = "Joker", effect = "Suit Mult", cost_mult = 1.0, config = {extra = {s_mult = 100, suit = 'Diamonds'}}},
--
-- Changes:
-- - s_mult = 3 → s_mult = 100 (100x mult for diamonds!)
-- - cost = 5 → cost = 1


-- ============================================
-- EXAMPLE 4: Modify starting resources
-- ============================================
-- Search for "starting_params" in game.lua and modify values like:
-- - joker_slots (number of joker slots)
-- - consumable_slots (number of consumable slots)
-- - hands (number of hands per round)
-- - discards (number of discards per round)


-- ============================================
-- EXAMPLE 5: Create a custom joker (ADVANCED)
-- ============================================
-- Add this after line 529 in game.lua:
--
-- j_custom_mega = {
--     order = 999,
--     unlocked = true,
--     discovered = true,
--     blueprint_compat = true,
--     perishable_compat = true,
--     eternal_compat = true,
--     rarity = 4,
--     cost = 10,
--     name = "Custom Mega Joker",
--     pos = {x=0, y=0},  -- Use same sprite as basic joker
--     set = "Joker",
--     effect = "Mult",
--     cost_mult = 1.0,
--     config = {mult = 1000}
-- },


-- ============================================
-- HOW TO APPLY MODS
-- ============================================
-- 1. Open game.lua in a text editor
-- 2. Find the joker you want to modify (search for "j_joker" etc.)
-- 3. Make your changes
-- 4. Save the file
-- 5. Run the game: love balatro_editable/
-- 6. If there's an error, check the terminal for the line number


-- ============================================
-- TIPS
-- ============================================
-- - Always backup game.lua before editing!
-- - Make one change at a time and test
-- - Lua is case-sensitive: "Mult" ≠ "mult"
-- - Don't forget commas between properties
-- - Check matching brackets: { } and quotes: " "
