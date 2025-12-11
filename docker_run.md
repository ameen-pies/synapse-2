# from project folder ROOT
docker compose up --build


# Expected features
| Service            | Port  | URL                                            |
| ------------------ | ----- | ---------------------------------------------- |
| Frontend           | 3000  | [http://localhost:3000](http://localhost:3000) |
| Node API           | 5000  | [http://localhost:5000](http://localhost:5000) |
| Recommender Python | 6000  | [http://localhost:6000](http://localhost:6000) |
| MongoDB            | 27017 | (interne)                                      |


The project folder looks like : 

synapse/
│
├── docker-compose.yml
├── README.MD
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   └── ...
│
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── server.js
    ├── routes/
    ├── models/
    ├── utils/
    ├── recommendation_system/
    ├── requirements.txt (si tu utilises Python dans recommender)
    └── ...
