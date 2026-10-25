# Personal Portfolio Website

A personal portfolio website built using HTML, CSS, and JavaScript. It includes Google Sign-In authentication and an additional Multi-Factor Authentication (MFA) step using a Time-based One-Time Password (TOTP) authenticator.

## Features

- **Google Sign-In:** Sign in using a Google account.
- **Multi-Factor Authentication (MFA):** Additional verification using a six-digit authenticator code.
- **QR Code Setup:** Scan the QR code with a compatible authenticator app to configure MFA.
- **Session Management:** Maintains the current browser session after successful authentication.
- **Responsive Design:** Provides a user-friendly interface across different screen sizes.
- **Portfolio Page:** Displays personal information, skills, projects, and other portfolio details.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Google Identity Services
- TOTP-based authentication
- GitHub and GitHub Pages
- XAMPP for local testing

## Project Structure

```text
portfolio-simple/
├── README.md
├── auth.js
├── index.html
├── me.jpg
├── portfolio.html
├── portfolio.js
├── style.css
└── totp.js
```

## How to Run Locally

1. Install and open XAMPP.
2. Start the Apache server.
3. Copy the project folder into the `htdocs` directory.
4. Open your browser and navigate to:

   `http://localhost/portfolio-simple/`

5. Sign in using Google.
6. Follow the MFA setup instructions and scan the QR code using a compatible authenticator app.
7. Enter the six-digit verification code to access the portfolio.

## Deployment Using GitHub Pages

1. Push the project files to your GitHub repository.
2. Open the repository on GitHub.
3. Navigate to **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and the `/(root)` folder.
6. Click **Save**.
7. After deployment completes, open the published website URL displayed in the Pages settings.

## Google Sign-In Configuration

For Google Sign-In to work on the deployed website:

1. Open the Google Cloud Console.
2. Select the Google Cloud project associated with your OAuth client.
3. Open the OAuth client configuration.
4. Add the following under **Authorized JavaScript origins**:

   - Local testing: `http://127.0.0.1:5500`
   - GitHub Pages: `https://maneeshaveeramreddy.github.io`

5. Save the changes and test Google Sign-In on the deployed site.

## Security Notes

- This project demonstrates front-end authentication and MFA workflows.
- Browser `localStorage` and `sessionStorage` are not secure storage for production authentication secrets.
- GitHub Pages provides static hosting and does not provide a backend for securely validating authentication or TOTP codes.
- A production-ready application should validate authentication and MFA on a trusted server, protect session credentials, and securely store user data.
- Never commit OAuth client secrets, API secrets, or other private credentials to a public repository.

## Future Improvements

- Implement server-side authentication and TOTP verification.
- Add secure session handling and logout functionality.
- Improve accessibility and mobile responsiveness.
- Add more portfolio projects and detailed project descriptions.

## Author

**Maneesha Veeramreddy**

GitHub: [ManeeshaVeeramreddy](https://github.com/ManeeshaVeeramreddy)

---

*This project was developed as a personal portfolio website with Google Sign-In and an additional MFA verification step.*
