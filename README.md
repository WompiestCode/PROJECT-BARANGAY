# Barangay Milagrosa Community Desk

For Some reason eto pinapa recommend

The site is a static multi-page website and can be hosted on GitHub Pages. Firebase Authentication and Cloud Firestore provide accounts and private realtime conversations; GitHub Pages does not provide a database or run server-side code.

## Firebase setup

1. Create a Firebase project and register a Web app.
2. In Firebase Authentication, enable **Email/Password** sign-in.
3. Create a Cloud Firestore database.
4. Publish the rules in [`firestore.rules`](./firestore.rules) in the Firebase console under **Firestore Database → Rules**.
5. Copy the web app's `apiKey`, `authDomain`, `projectId`, and `appId` into [`firebase-config.js`](./firebase-config.js), replacing the `YOUR_...` placeholders.
6. In Firebase Authentication settings, add the deployed GitHub Pages domain to **Authorized domains**.
7. Open `index.html` through a local static web server while developing (ES modules do not work from a `file://` URL), then deploy the repository with GitHub Pages.

The Firebase web configuration is public client configuration, not a service-account credential. Never put service-account keys or other private credentials in this repository. Authentication protects the Firestore data; the supplied rules limit profile access to signed-in users and conversation/message access to participants.

Users can create accounts and privately message another registered user. Display names, but not email addresses, are visible in the signed-in user directory. This site does not implement staff verification, moderation, emergency response, or account recovery beyond Firebase's built-in authentication features.


