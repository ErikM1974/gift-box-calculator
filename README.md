# Gift Box Price Calculator - Northwest Custom Apparel

This application is a gift box price calculator for Northwest Custom Apparel. It allows users to calculate the price of gift boxes containing various garments and optional caps.

## Important Note

This is a Node.js application and cannot be run using a live server or by opening the HTML file directly in a browser. You must run it using Node.js as described in the setup instructions below.

## Setup and Running the Application

1. Ensure you have Node.js version 18 or higher installed. You can check your version with:
   ```
   node --version
   ```

2. Clone the repository:
   ```
   git clone https://github.com/your-username/gift-box-calculator.git
   cd gift-box-calculator
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory and add the following environment variables:
   ```
   PORT=3000
   INITIAL_ACCESS_TOKEN=your_initial_access_token
   REFRESH_TOKEN=your_refresh_token
   CASPIO_CLIENT_ID=c3eku948
   CASPIO_API_URL=https://c3eku948.caspio.com/rest/v2/tables/Sanmar_Pricing_2024/records
   ```
   Replace `your_initial_access_token` and `your_refresh_token` with your actual Caspio API credentials.

5. Start the server:
   ```
   npm start
   ```

6. Open a web browser and navigate to `http://localhost:3000` to use the application.

## Troubleshooting

- If you encounter any issues, make sure you're running the application using Node.js and not a live server or by opening the HTML file directly.
- Check that all environment variables in the `.env` file are correctly set.
- Ensure you have the latest version of Node.js installed.

## Development

- The main server file is `server.js`
- Client-side JavaScript is in `public/index.js`
- HTML template is in `public/index.html`

## Security Notes

- Sensitive information is stored in the `.env` file, which is not committed to the repository.
- Make sure to keep your `.env` file secure and never share it publicly.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

## License

This project is licensed under the MIT License.