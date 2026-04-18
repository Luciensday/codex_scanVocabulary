# AGENTS.md

## Project Overview
- **Project:** Who Let Me Out — an app that turns a user's selfie into funny animal versions like fox, dog, cat, elephant, and 10+ more animals, then exports them as GIFs for social media and messaging apps.
- **Target user:** quirky people who like funny, short-form, social-media-style content
- **My skill level:** [beginner / intermediate / expert]
- **Stack:** not decided yet

## Product Direction
- After the user uploads their face, the app should generate a gallery of transformed versions based on different animals.
- The gallery should feel playful, visual, and scrollable, like a moodboard or Pinterest-style collage.
- The result screen should show many generated cards at once instead of making the user open one result at a time.
- The app should support at least 15 to 20 generated images per session.
- The app should include at least 10 or more animals overall.
- The app should export selected results as GIFs that can be reused as social media stickers, reaction images, or emoji-style assets for apps like WhatsApp.

## Layout Reference
- Use the provided image as the layout direction for the post-upload screen.
- The screen should use a masonry-style grid with rounded image cards of different heights.
- The grid should feel editorial and dense, with very small gaps between cards.
- The layout should mix portrait, square, and taller cards to create visual rhythm.
- The experience should feel more like browsing a visual board than using a plain utility app.
- The upload result page should prioritize images first, with actions like save/export shown as simple overlays or small buttons.

## Generation Rules
- Each animal should have multiple predefined sub-types or styles.
- Example for dog: brown dog, black dog, chihuahua dog, fluffy dog, cartoon dog, Snoopy-style dog.
- The same idea should apply to other animals, with realistic, stylized, and cartoon-like versions.
- The system should generate variety from one uploaded face while still keeping the user's identity recognizable.
- The output set should include a mix of funny, cute, weird, and highly shareable results.
- Minimum scope: fox, dog, cat, elephant, plus at least 10 more animals.
- Target output per upload: 15 to 20 images.
- Some outputs should be suitable for looping GIF creation and sticker-like export.

## Commands
- **Install:** [e.g. `npm install`, `pip install -r requirements.txt`]
- **Dev:** [e.g. `npm run dev`, `python manage.py runserver`]
- **Build:** [e.g. `npm run build`]
- **Test:** [e.g. `npm test`, `pytest`]
- **Lint:** [e.g. `npm run lint`, `ruff check .`]

## Do
- Read existing code before modifying anything
- Match existing patterns, naming, and style
- Handle errors gracefully — no silent failures
- Keep changes small and scoped to what was asked
- Run dev/build after changes to verify nothing broke
- Ask clarifying questions before guessing

## Don't
- Install new dependencies without asking
- Delete or overwrite files without confirming
- Hardcode secrets, API keys, or credentials
- Rewrite working code unless explicitly asked
- Push, deploy, or force-push without permission
- Make changes outside the scope of the request

## When Stuck
- If a task is large, break it into steps and confirm the plan first
- If you can't fix an error in 2 attempts, stop and explain the issue

## Testing
- Run existing tests after any change
- Add at least one test for new features
- Never skip or delete tests to make things pass

## Git
- Small, focused commits with descriptive messages
- Never force push

## Response Style
- always respond with clear & concise messages
- use plain English when explaining to the User
- avoid long sentences, complex words, or long paragraphs
