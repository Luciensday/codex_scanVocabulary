# Who Let Me Out

## Overview
- Who Let Me Out lets a user upload their face and generate funny animal versions of themselves.
- The results should include realistic, stylized, and cartoon-inspired transformations.
- The final images can be turned into GIFs for use as social stickers, reaction images, or emoji-style content on apps like WhatsApp.

## Target Audience
- People who like quirky, funny, visual, short-form content
- Users who enjoy playful self-expression and meme-style sharing

## Layout Direction
- The post-upload screen should follow the visual style of the provided reference image.
- The layout should use a masonry-style collage with rounded cards in different heights and sizes.
- The page should feel like a visual moodboard or Pinterest-style results wall.
- The gallery should show many generated images at once.
- Images should be the main focus, with save/export actions kept small and simple.
- The page should feel dense, playful, and scrollable rather than minimal or tool-like.

## Generation Requirements
- After one face upload, generate 15 to 20 image results.
- Support at least 10 or more animals overall.
- Include core animals like fox, dog, cat, and elephant.
- Each animal should have multiple predefined variants or species styles.
- Example for dog: brown dog, black dog, chihuahua dog, fluffy dog, cartoon dog, Snoopy-style dog.
- The same pattern should be used for other animals so each category has strong variety.
- Keep the user's identity recognizable across the outputs.
- Make the results funny, expressive, and highly shareable.

## Popular Animal Meme and Cartoon References
- Doge
- Cheems
- Grumpy Cat
- Keyboard Cat
- Nyan Cat
- Smudge the Cat
- Big Floppa
- Gabe the Dog
- Longcat
- Phteven
- Ceiling Cat
- Bugs Bunny
- Daffy Duck
- Donald Duck
- Garfield
- Mickey Mouse
- Road Runner
- Scooby-Doo
- Snoopy
- Tom
- Jerry
- Yogi Bear

## Output
- Users should be able to save single images.
- Users should be able to export selected results as GIFs.
- GIFs should work well as social content, sticker-like assets, or emoji-style reactions.

## MVP Build
- Built as a Next.js web app
- Uses OpenRouter with `google/gemini-3.1-flash-image-preview` for real image generation
- Single-session only for now
- Includes upload, live generation, masonry gallery, animal filters, favorites, PNG download, share links, and GIF export

## Local Setup
1. Use Node `22.22.2` or newer
2. Copy `.env.example` to `.env.local`
3. Add your `OPENROUTER_API_KEY` to `.env.local`
4. Install dependencies with `npm install`
5. Start the app with `npm run dev`

## Commands
- `npm run dev` — start local development
- `npm run build` — run the production build
- `npm run lint` — lint the codebase
- `npm test` — run the small MVP test suite

## Notes
- Share links are stored locally on the server in `.data/shares`
- The app generates 18 predefined animal variants per upload
- GIF export uses favorited cards first, otherwise it exports the full finished board
