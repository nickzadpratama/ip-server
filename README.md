# P2-Challenge-1 (Server Side)

> Tuliskan API Docs kamu di sini

Tema: Rent Room (Mami Kos)

Mami Kos Server
Mami Kos is an application to share and manage Mami Kos 
boarding house. It performs standard CRUD actions based on RESTful concept.

This app has :

RESTful endpoint for asset's CRUD operation
JSON formatted response
 

Tech Stack used to build this app :

Node JS
Express JS framework
PostgreSQL

Base URL: https://localhost:3000
Format Data: JSON

Global Responses
These responses are applied globally on all endpoints

Response (400 - SequelizeValidationError or SequelizeUniqueConstraintError)
{
  "message": validation error message
}

Response (400 - SequelizeDatabaseError or SequelizeForeignKeyConstraintError)
{
  "message": "Invalid input"
}

Response (401 - InvalidLogin)
{
  "message": "Please input email or password"
}

Response (401 - LoginError)
{
  "message": "Invalid email or password"
}

Response (401 - Unauthorized or JsonWebTokenError)
{
  "message": "Please login first"
}

Response (403 - Forbidden)
{
  "message": "You don't have any access"
}

Response (404 - NotFound)
{
  "message": "Data not found"
}

Response (500 - ServerError)
{
  "message": "Internal server error"
}

RESTful endpoints

GET /
Landing Page

Request Header
not needed

Request Body
not needed

Response (200)
This is Mami kos Server

POST /pub/register
Create new user

Request Header
not needed

Response (200)
{
    "message": "Create new User",
    "data": {
        "role": "staff",
        "id": 8,
        "username": "nickz",
        "email": "nick@gmail2346.com",
        "phoneNumber": "021123456",
        "address": "Jakarta",
        "updatedAt": "2026-08-29T16:05:03.345Z",
        "createdAt": "2026-08-29T16:05:03.345Z"
    }
}

Request Body
{
    "username": "<user username>",
    "email": "<user email>",
    "role": "<user role>",
    "phoneNumber": "<user phoneNumber>",
    "address": "<user address>",
    "updatedAt": "2026-08-29T16:05:03.345Z",
    "createdAt": "2026-08-29T16:05:03.345Z"
}

POST /login
Login into server

Request Header
not needed

Request Body
{
    "email": "<email to get insert into>",
    "password": "<password to get insert into>",
}

Response (200)
access_token

GET /lodgings
Create new user

Request Header
{
  "access_token": "<your access token>"
}

Request Body
not needed

Response (200)
{
    "message": "Succeed read data Lodging",
    "data": [
        {
            "id": <given id by system>,
            "name": "<lodging name>",
            "facility": "<lodging facility>",
            "roomCapacity": "<lodging roomCapacity>",
            "imgUrl": "<lodging imgUrl>",
            "location": "<lodging location>",
            "price": "<lodging price>",
            "typeId": "<lodging typeId>",
            "authorId": "<lodging authorId>",
            "User": {
                "id": "<user id>",
                "username": "<user username>",
                "email": "<user email>",
                "role": "<user role>",
                "phoneNumber": "<user phoneNumber>",
                "address": "<user address>"
            }
        },
        {
            "id": <given id by system>,
            "name": "<lodging name>",
            "facility": "<lodging facility>",
            "roomCapacity": "<lodging roomCapacity>",
            "imgUrl": "<lodging imgUrl>",
            "location": "<lodging location>",
            "price": "<lodging price>",
            "typeId": "<lodging typeId>",
            "authorId": "<lodging authorId>",
            "User": {
                "id": "<user id>",
                "username": "<user username>",
                "email": "<user email>",
                "role": "<user role>",
                "phoneNumber": "<user phoneNumber>",
                "address": "<user address>"
            }
        },
        ...
    ]
}

GET /lodgings/:id
Get single lodging as defined by the id provided

Request Header
{
  "access_token": "<your access token>"
}

Request Body
not needed

Response (200)
{
    "message": "Succeed read data Lodging",
    "data": {
        "id": <given id by system>,
        "name": "<lodging name>",
        "facility": "<lodging facility>",
        "roomCapacity": "<lodging roomCapacity>",
        "imgUrl": "<lodging imgUrl>",
        "location": "<lodging location>",
        "price": "<lodging price>",
        "typeId": "<lodging typeId>",
        "authorId": "<lodging authorId>",
        "User": {
            "id": "<user id>",
            "username": "<user username>",
            "email": "<user email>",
            "role": "<user role>",
            "phoneNumber": "<user phoneNumber>",
            "address": "<user address>"
        }
    }
}

POST /lodgings
Create new lodging

Request Header
{
  "access_token": "<your access token>"
}

Request Body
{
    "name": "<name to get insert into>",
    "facility": "<facility to get insert into>",
    "roomCapacity": "<roomCapacity to get insert into>",
    "imgUrl": "<imgUrl to get insert into>",
    "location": "<location to get insert into>",
    "price": "<price to get insert into>",
    "typeId": "<typeId to get insert into>",
    "authorId": "<authorId to get insert into>"
}

Response (201)
{
    "message": "Succeed create data lodging",
    "data": {
        "id": <given id by system>,
        "name": "<lodging name>",
        "facility": "<lodging facility>",
        "roomCapacity": "<lodging roomCapacity>",
        "imgUrl": "<lodging imgUrl>",
        "location": "<lodging location>",
        "price": "<lodging price>",
        "typeId": "<lodging typeId>",
        "authorId": "<lodging authorId>"
    }
}

PUT /lodgings/:id
Update a lodging defined by the id provided

Request Header
{
  "access_token": "<your access token>"
}

Request Body
{
    "name": "<name to get insert into>",
    "facility": "<facility to get insert into>",
    "roomCapacity": "<roomCapacity to get insert into>",
    "imgUrl": "<imgUrl to get insert into>",
    "location": "<location to get insert into>",
    "price": "<price to get insert into>",
    "typeId": "<typeId to get insert into>",
    "authorId": "<authorId to get insert into>"
}

Response (200)
{
    "message": "Succeed update data lodging",
    "data": {
        "id": <given id by system>,
        "name": "<lodging name>",
        "facility": "<lodging facility>",
        "roomCapacity": "<lodging roomCapacity>",
        "imgUrl": "<lodging imgUrl>",
        "location": "<lodging location>",
        "price": "<lodging price>",
        "typeId": "<lodging typeId>",
        "authorId": "<lodging authorId>"
    }
}

PATCH /lodgings/:id
Update an image lodging defined by the id provided

Request Header
{
  "access_token": "<your access token>"
}

Request Body
{
    "imgUrl": "<imgUrl to get insert into>",
}

Response (200)
{
    "message": "Image <lodging name> success to update"
}

DELETE /lodgings/:id
Delete a lodging defined by the id provided

Request Header
{
  "access_token": "<your access token>"
}

Request Body
not needed

Response (200)
{
    "message": "<lodging name> succeed to delete",
    "data": {
        "id": <given id by system>,
        "name": "<lodging name>",
        "facility": "<lodging facility>",
        "roomCapacity": "<lodging roomCapacity>",
        "imgUrl": "<lodging imgUrl>",
        "location": "<lodging location>",
        "price": "<lodging price>",
        "typeId": "<lodging typeId>",
        "authorId": "<lodging authorId>"
    }
}

GET /types
Get all types

Request Header
{
  "access_token": "<your access token>"
}

Request Body
not needed

Response (200)
{
    "massage": "Succeed read data type",
    "data": [
        {
            "id": <given id by system>,
            "name": <type name>
        },
        {
            "id": <given id by system>,
            "name": <type name>
        },
        ...
    ]
}

POST /types
Create types

Request Header
{
    "access_token": "<your access token>"
}

Request Body
{
    "name": "<name to get insert into>"
}

Response (201)
{
    "massage": "Succeed read data type",
    "data": [
        {
            "id": <given id by system>,
            "name": <type name>
        }
    ]
}

PUT /types
Update a type defined by the id provided

Request Header
{
    "access_token": "<your access token>"
}

Request Body
{
    "name": "<name to get insert into>"
}

Response (201)
{
    "massage": "Succeed update data type",
    "data": [
        {
            "id": <given id by system>,
            "name": <type name>
        }
    ]
}

GET /pub/lodgings
Get all lodgings public

Request Header
not needed

Request Body
not needed

Response (200)
{
    "page": 1,
    "data": [
        {
            "id": <given id by system>,
            "name": "<lodging name>",
            "facility": "<lodging facility>",
            "roomCapacity": "<lodging roomCapacity>",
            "imgUrl": "<lodging imgUrl>",
            "location": "<lodging location>",
            "price": "<lodging price>",
            "typeId": "<lodging typeId>",
            "authorId": "<lodging authorId>",
            "User": {
                "id": "<user id>",
                "username": "<user username>",
                "email": "<user email>",
                "role": "<user role>",
                "phoneNumber": "<user phoneNumber>",
                "address": "<user address>"
            }
        },
        {
            "id"id": <given id by system>,
            "name": "<lodging name>",
            "facility": "<lodging facility>",
            "roomCapacity": "<lodging roomCapacity>",
            "imgUrl": "<lodging imgUrl>",
            "location": "<lodging location>",
            "price": "<lodging price>",
            "typeId": "<lodging typeId>",
            "authorId": "<lodging authorId>",
            "User": {
                "id": "<user id>",
                "username": "<user username>",
                "email": "<user email>",
                "role": "<user role>",
                "phoneNumber": "<user phoneNumber>",
                "address": "<user address>"
            }
        },
        ...
    ],
    "totalData": 21,
    "totalPage": 2,
    "dataPerPage": 10,
    "message": "Succeed read data Lodgings"
}

GET /pub/lodgings/:id
Get single lodging as defined by the id provided

Request Header
not needed

Request Body
not needed

Response (200)
{
    "message": "Succeed read detail lodging",
    "data": 
        {
            "id": <given id by system>,
            "name": "<lodging name>",
            "facility": "<lodging facility>",
            "roomCapacity": "<lodging roomCapacity>",
            "imgUrl": "<lodging imgUrl>",
            "location": "<lodging location>",
            "price": "<lodging price>",
            "typeId": "<lodging typeId>",
            "authorId": "<lodging authorId>",
        },
}

GET /pub/types
Get all types public

Request Header
not needed

Request Body
not needed

Response (200)
{
    "massage": "Succeed read data type",
    "data": [
        {
            "id": <given id by system>,
            "name": <type name>
        },
        {
            "id": <given id by system>,
            "name": <type name>
        },
        ...
    ]
}