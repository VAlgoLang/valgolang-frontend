# VAlgoLang UI Frontend

Frontend for VAlgoLang, written in React and Typescript

### Installation

#### Docker

If you haven't installed the VAlgoLang Compiler or want a quick way to startup the best way is to use docker:

` docker run -p 5000:5000 manimdsl/manimdsl-frontend  `

And go to `localhost:3000` in a browser.

#### Alternative Instructions

1. Clone this repo
2. Run `npm install` to get all the dependencies
3. Run `./antlrBuild.sh` to get all the grammar files compiled for ANTLR4
4. Run `npm start` to start up the React Dev Environment (defaults to port 3000)

