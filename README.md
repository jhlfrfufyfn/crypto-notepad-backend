# crypto-notepad-backend

## Setup
Clone the repository and run `npm install` to install the dependencies.

## Run
Run 'npm run dev' to start the server. The server will be running on port 3001

## API
### Authentication
#### POST /api/auth/register
Register a new user. The request body should contain the following fields:
- username
- password

#### POST /api/auth/login
Login a user. The request body should contain the following fields:
- username
- password

### Files
#### GET /api/files
Get all files for the current user.

#### POST /api/files
Create a new file. The request body should contain the following fields:
- name

#### GET /api/files/:id
Get a file by id.

#### PATCH /api/files/:id
Update a file by id. The request body should contain the following fields:
- content

#### DELETE /api/files/:id
Delete a file by id.

## License
MIT

## Author
[jhlfrfufyfn](github.com/jhlfrfufyfn)

## Acknowledgements
- [express]( https://expressjs.com/ )
