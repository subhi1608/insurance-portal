## Description

This node.js application is a CRUD operation tool for insurance management portal

- create,view,edit,delete clients
- create,view,edit,delete insurance policies
- create,view,edit,delete insurance claims

## Getting Started

### Prerequisites

1. Nodejs & Postgres must be installed in your system
2. Docker installed if you want to set up a container(not mandatory)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/subhi1608/insurance-portal.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Enter your env variables in `example.env` take example from example.env

### Folder Structure

app.js is the entrypoint of our application and inside /api folder we have the controllers,middleware,services and db layer files besides utils and constant files

## Usage

1. localhost:8000/api/v1/ is the base URL of our application (i.e if our application is running on PORT 8000).
2. you must be a user to perform any operation
   localhost:8000/api/v1/auth/signin for signin and localhost:8000/api/v1/auth/login for log in
