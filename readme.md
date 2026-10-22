# PlayForge 🎬
### Video Sharing Platform — Backend

PlayForge is a RESTful backend for a video-sharing and social media platform, built with Node.js, Express.js, and MongoDB. It provides APIs for user authentication, video management, comments, likes, playlists, and tweets.

## ✨ Features

- **Authentication & Authorization** — JWT-based authentication and protected routes.
- **Video Management** — Create, retrieve, update, and delete video resources.
- **Comments** — Add, retrieve, edit, and delete comments on videos.
- **Like System** — Toggle likes on videos, comments, and tweets.
- **Playlist Management** — Create playlists, update playlist details, and add or remove videos.
- **Tweets** — Create and manage text-based posts.
- **Pagination** — Retrieve comments in paginated results.
- **Database Integration** — MongoDB with Mongoose for data modeling.
- **Centralized Error Handling** — Consistent error and API response utilities.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express.js | Backend framework |
| MongoDB | NoSQL database |
| Mongoose | Object data modeling |
| JSON Web Tokens | Authentication |
| JavaScript (ES Modules) | Application development |

## 📁 Project Structure

```text
project-backend/
├── src/
│   ├── controllers/    # Request handling and business logic
│   ├── models/         # Mongoose schemas and models
│   ├── routes/         # API route definitions
│   ├── middlewares/    # Authentication and other middleware
│   ├── utils/          # API responses, errors, and helpers
│   ├── app.js          # Express app configuration
│   └── index.js        # Application entry point
├── .env                # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

*Note: Adjust the structure above to match your actual repository.*

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- npm

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/Venom-2006/project-backend.git
```

**2. Navigate to the project directory**

```bash
cd project-backend
```

**3. Install dependencies**

```bash
npm install
```

**4. Configure environment variables**

Create a `.env` file in the project root and add the variables required by your application.

Example — replace the names and values with those used in your code:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
```

Never commit real credentials, tokens, or secrets to GitHub.

**5. Start the development server**

```bash
npm run dev
```

The server will start on the configured port if the database connection and environment variables are valid.

## 🔗 API Modules

PlayForge provides API modules for the following resources:

| Module | Functionality |
|---|---|
| Users | Registration, login, logout, and profile operations |
| Videos | Video resource management |
| Comments | Add, retrieve, update, and delete comments |
| Likes | Like and unlike videos, comments, and tweets |
| Playlists | Playlist creation and video organization |
| Tweets | Text-based social posts |

Refer to the route files for the exact endpoint paths, HTTP methods, and required parameters.

## 🔐 Authentication

Protected endpoints use JWT authentication middleware. Requests must include valid authentication credentials through the mechanism configured by the application, such as an access token or authentication cookie.

## 🧪 Testing

API endpoints can be tested using tools such as [Postman](https://www.postman.com/) or [Thunder Client](https://www.thunderclient.com/).

Recommended test cases include:

- Valid and invalid authentication credentials
- Missing or malformed IDs
- Requests for nonexistent resources
- Unauthorized update and delete operations
- Duplicate like attempts
- Pagination and empty results

## 🛣️ Future Improvements

- Automated API tests
- Swagger/OpenAPI documentation
- Request validation and rate limiting
- Production deployment
- Frontend integration

## 👨‍💻 Author

**Venom-2006**

GitHub: [github.com/Venom-2006](https://github.com/Venom-2006)

## 📄 License

Add a license file if you intend to distribute this project under a specific open-source license.
