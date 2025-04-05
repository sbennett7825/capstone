# GLPAAC Front-End
These are the instructions for the front-end client for the GLPAAC (Gestalt Language Processors Augmentative and Alternative Communication) application.

# Description
This application provide a means of communication using artificial text-to-speech technology for non-speaking and minimally speaking individuals of all ages. Picture symbols are provided for each card for pre-literate users, as well as text for literate users. The external opensymbols.org API can be accessed to edit cards and add pictures that can be searched for under the "edit cards" option from the dropdown menu and selected. Voice options can be selected and preferences can be saved and loaded when logging in. Pre-built phrases/sentence starters from the Natural Language Acquisition (NLA) language development framework are provided to promote language development and ease of use for gestalt language processors (i.e. People who process early language in "strings" or "chunks" [also known as echolalia] rather than single words.).

# Deployment Link
- http://localhost:5173/

## Setup Instructions
1. Clone the repository
2. Navigate to the `GLPAAC-front-end` directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development client in a separate terminal for `GLPAAC-front-end`
   ```
   npm run dev
   ```

# Testing
- Run test files in the terminal:
   ```
   npm run test
   ```
# Standard User Flow
1. Open the "Sign Up" form to create an account by clicking the "Get Started" button link on the landing page, or by clicking the dropdown menu button on the landing page and selecting "Sign Up"
2. Fill in the required information on the "Sign Up" form and click submit
3. Open the "Log In" form by clicking the dropdown menu button on the landing page and selecting "Log In"
4. Enter credentials in the "Log In" form and click "Log In"
5. The Communicator component will be mounted and the LandingPage component will close.
6. Click a button or type to formulate a message that will appear in the Textarea in the top row
7. Play the message by clicking the button with the "play" icon in the top row
8. Delete a word by clicking the button with the "backspace" icon
9. Clear the Textarea completely by clicking the button with the "X" icon
10. Edit the voice settings by clicking the dropdown menu button and selecting "Voice Settings"
11. The Voice Settings Dialog will appear. Rate, pitch, and voice may be tested and saved to the user_preferences
12. Edit a card by clicking the dropdown menu and selecting "Edit Cards"
13. All cards will be ringed in blue, indicating they are in edit mode
14. Cards can be dragged and dropped to any area in the card grid
15. Click on a card to open the "Edit Card" dialog
16. Users can type in the Card label in the "Edit Text" input
17. Users can search symbols on the opensymbols.org API by typing in a query in the "Find Symbol" input
18. The "Results for: [query]" section will display the query entered
18. Users can select one desired symbol in the "Results" section, which will be ringed in blue when selected and the "None Selected" text will change to "Image Selected" when a new image has been selected.
19. Users can click "Save" to save the new symbol and/or text to the button or click "Cancel" to keep the card the same
20. To exit "Edit Mode", users can click the dropdown and click "Exit Edit Mode". Now cards will no longer be ringed and blue, and return to the text entering functionality.
21. Users can log out of their account by clicking the dropdown menu and selecting "Log Out", which returns the user to the landing page, clears out localStorage and disconnects user_preferences for that account.

# ***SEE GLPAAC-back-end README.md file for further setup of back-end***










# Further Information for React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
